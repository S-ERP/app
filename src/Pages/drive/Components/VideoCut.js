import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { View, PanResponder, TouchableOpacity, StyleSheet } from "react-native";
import { SNavigation, SText, SView, SPopup, SInput, SHr, STheme } from "servisofts-component";
import SSocket from "servisofts-socket";
import { Actions } from "..";

const STRIP_HEIGHT = 58;
const HANDLE_W = 16;
// const FRAME_W      = 60;
const FRAME_COUNT = 10;
const GOLD = "#f5c518";

const QUALITY_OPTIONS = [
    { label: "2160p", desc: "4K", crf: 18 },
    { label: "1080p", desc: "HD", crf: 23 },
    { label: "720p", desc: "HD", crf: 28 },
    { label: "480p", desc: "SD", crf: 35 },
    { label: "360p", desc: "SD", crf: 40 },
];

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoCut(props) {
    const url = props.url ?? SNavigation.getParam("url");

    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [paused, setPaused] = useState(true);
    const [startRatio, setStartRatio] = useState(0);
    const [endRatio, setEndRatio] = useState(1);
    const [quality, setQuality] = useState(QUALITY_OPTIONS[2]);
    const [videoError, setVideoError] = useState(false);

    // Thumbnail URLs derived from duration — no canvas needed
    const thumbUrls = useMemo(() => {
        if (!duration) return [];
        const base = SSocket.api.drive;
        const rest = url.startsWith(base) ? url.slice(base.length) : url;
        return Array.from({ length: FRAME_COUNT }, (_, i) => {
            // Use midpoint of each segment so the thumbnail matches the visual center of that slot
            const ms = Math.round(((i + 0.5) / FRAME_COUNT) * duration * 1000);
            return `${base}thumbnail/${rest}?ms=${ms}`;
        });
    }, [duration, url]);

    const videoRef = useRef(null);
    const trackRef = useRef(null);
    const startRatioRef = useRef(0);
    const endRatioRef = useRef(1);
    const durationRef = useRef(0);

    // ── Play / Pause sync ────────────────────────────────────────────
    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;
        if (paused) vid.pause(); else vid.play();
    }, [paused]);

    // ── Extract filmstrip frames ─────────────────────────────────────
    // Frames are derived from the server thumbnail API (see thumbUrls), no extraction needed.

    // ── Track bounds (absolute screen coords) ───────────────────────
    const getTrackBounds = () => {
        if (trackRef.current) {
            const r = trackRef.current.getBoundingClientRect();
            return { x: r.left, width: r.width };
        }
        return { x: 0, width: 320 };
    };

    // ── Seek ─────────────────────────────────────────────────────────
    const seekTo = (ratio) => {
        const t = Math.max(0, Math.min(ratio, 1)) * durationRef.current;
        if (videoRef.current) videoRef.current.currentTime = t;
        setCurrentTime(t);
    };

    // ── PanResponders ────────────────────────────────────────────────
    const playheadPan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gs) => {
            const { x, width } = getTrackBounds();
            seekTo((gs.moveX - x) / width);
        },
    })).current;

    const startPan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gs) => {
            const { x, width } = getTrackBounds();
            let r = (gs.moveX - x) / width;
            r = Math.max(0, Math.min(r, endRatioRef.current - 0.01));
            setStartRatio(r);
            startRatioRef.current = r;
        },
    })).current;

    const endPan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gs) => {
            const { x, width } = getTrackBounds();
            let r = (gs.moveX - x) / width;
            r = Math.max(startRatioRef.current + 0.01, Math.min(r, 1));
            setEndRatio(r);
            endRatioRef.current = r;
        },
    })).current;

    const startSec = startRatio * duration;
    const endSec = endRatio * duration;
    const progressRatio = duration > 0 ? currentTime / duration : 0;

    const handleAccept = useCallback(() => {
        const decoded = decodeURIComponent(url.split("?")[0]);
        const currentName = decoded.split("/").filter(Boolean).pop() ?? "output.mp4";
        let inputRef = null;

        SPopup.open({
            key: "video_rename_popup",
            content: (
                <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, width: 340 }} padding={16} withoutFeedback>
                    <SText bold fontSize={15}>Nombre del archivo de salida</SText>
                    <SHr height={12} />
                    <SInput
                        autoFocus
                        style={{
                            fontSize: 10
                        }}
                        label="Nombre"
                        defaultValue={currentName}
                        ref={ref => inputRef = ref}
                    />
                    <SHr height={16} />
                    <SView row style={{ justifyContent: "flex-end", gap: 8 }}>
                        <TouchableOpacity
                            onPress={() => SPopup.close("video_rename_popup")}
                            style={styles.cancelBtn}
                        >
                            <SText style={styles.cancelBtnText}>Cancelar</SText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                const val = inputRef?.getValue?.();
                                const typed = (val || currentName).trim() || currentName;
                                const origExt = currentName.includes(".") ? currentName.slice(currentName.lastIndexOf(".")) : "";
                                const newName = origExt && !typed.includes(".") ? typed + origExt : typed;


                                SPopup.close("video_rename_popup");
                                if (props.onAccept) props.onAccept({ startSec, endSec, crf: quality.crf, newName });
                                else alert(`Cortar  ${formatTime(startSec)} → ${formatTime(endSec)}  (CRF ${quality.crf})\n→ ${newName}`);
                            }}
                            style={styles.trimBtn}
                        >
                            <SText style={styles.trimBtnText}>Confirmar</SText>
                        </TouchableOpacity>
                    </SView>
                </SView>
            ),
        });
    }, [startSec, endSec, quality, url]);

    return (
        <SView col="xs-12" flex center style={styles.root}>

            {/* ── Video player ── */}
            <SView col="xs-12" style={styles.videoWrap}>
                <video
                    ref={videoRef}
                    src={url}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    onLoadedMetadata={e => {
                        durationRef.current = e.target.duration;
                        setDuration(e.target.duration);
                    }}
                    onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
                    onEnded={() => setPaused(true)}
                    onError={() => setVideoError(true)}
                />
                {videoError && (
                    <View style={styles.videoErrorOverlay} pointerEvents="none">
                        <SText style={styles.videoErrorText}>⚠️ Este formato no es compatible con el navegador.</SText>
                        <SText style={styles.videoErrorSub}>Los navegadores solo soportan MP4, WebM y Ogg. AVI, MKV y otros requieren conversión previa.</SText>
                    </View>
                )}
                {/* time badge */}
                <View style={styles.timeBadge} pointerEvents="none">
                    <SText style={styles.timeBadgeText}>
                        {formatTime(currentTime)}  /  {formatTime(duration)}
                    </SText>
                </View>
            </SView>

            {/* ── Trimmer bar (QuickTime style) ── */}
            <SView col="xs-12" row style={styles.trimmerBar}>

                {/* Play button */}
                <TouchableOpacity onPress={() => setPaused(p => !p)} style={styles.playBtn}>
                    <SText style={styles.playBtnText}>{paused ? "▶" : "⏸"}</SText>
                </TouchableOpacity>

                {/* Filmstrip + handles */}
                <View
                    ref={trackRef}
                    style={styles.filmstrip}
                    onMouseDown={e => e.preventDefault()}
                    onClick={e => {
                        const { x, width } = getTrackBounds();
                        seekTo((e.clientX - x) / width);
                    }}
                    onMouseMove={e => {
                        if (e.buttons === 1) {
                            const { x, width } = getTrackBounds();
                            seekTo((e.clientX - x) / width);
                        }
                    }}
                >
                    {/* Frame thumbnails */}
                    {thumbUrls.length > 0
                        ? thumbUrls.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                style={{
                                    width: `${100 / FRAME_COUNT}%`,
                                    height: STRIP_HEIGHT,
                                    objectFit: "cover",
                                    objectPosition: "center",
                                    flexShrink: 0,
                                    display: "block",
                                    pointerEvents: "none",
                                }}
                                draggable={false}
                            />
                        ))
                        : <View style={styles.framesLoading} />
                    }

                    {/* Dim — left of selection */}
                    <View style={[styles.dimOverlay, { left: 0, width: `${startRatio * 100}%` }]} />

                    {/* Dim — right of selection */}
                    <View style={[styles.dimOverlay, { left: `${endRatio * 100}%`, right: 0 }]} />

                    {/* Gold top/bottom rails of selection */}
                    <View style={[styles.selRailTop, { left: `${startRatio * 100}%`, width: `${(endRatio - startRatio) * 100}%` }]} />
                    <View style={[styles.selRailBottom, { left: `${startRatio * 100}%`, width: `${(endRatio - startRatio) * 100}%` }]} />

                    {/* Playhead */}
                    <View
                        {...playheadPan.panHandlers}
                        style={[styles.playhead, { left: `${progressRatio * 100}%`, cursor: "ew-resize" }]}
                    />

                    {/* Left handle */}
                    <View
                        {...startPan.panHandlers}
                        style={[styles.handle, styles.handleLeft, { left: `${startRatio * 100}%`, cursor: "ew-resize" }]}
                        onClick={e => e.stopPropagation()}
                    >
                        <View style={styles.handleGrip} />
                        <View style={styles.handleGrip} />
                    </View>

                    {/* Right handle */}
                    <View
                        {...endPan.panHandlers}
                        style={[styles.handle, styles.handleRight, { left: `${endRatio * 100}%`, cursor: "ew-resize" }]}
                        onClick={e => e.stopPropagation()}
                    >
                        <View style={styles.handleGrip} />
                        <View style={styles.handleGrip} />
                    </View>
                </View>

                {/* Action buttons */}
                <View style={styles.actionBtns}>
                    <TouchableOpacity style={styles.trimBtn} onPress={handleAccept}>
                        <SText style={styles.trimBtnText}>Trim</SText>
                    </TouchableOpacity>
                    {props.onCancel && (
                        <TouchableOpacity style={styles.cancelBtn} onPress={props.onCancel}>
                            <SText style={styles.cancelBtnText}>Cancel</SText>
                        </TouchableOpacity>
                    )}
                </View>
            </SView>

            {/* ── Info row ── */}
            <SView col="xs-12" row style={styles.infoRow}>
                <SText style={styles.rangeText}>
                    {formatTime(startSec)}  →  {formatTime(endSec)}
                    {"  "}
                    <SText style={styles.durationText}>({formatTime(endSec - startSec)})</SText>
                </SText>
                <View style={styles.selectWrap}>
                    <select
                        value={quality.crf}
                        onChange={e => setQuality(QUALITY_OPTIONS.find(q => q.crf === Number(e.target.value)))}
                        style={selectStyle}
                    >
                        {QUALITY_OPTIONS.map(q => (
                            <option key={q.crf} value={q.crf}>{q.label} — {q.desc}</option>
                        ))}
                    </select>
                </View>
            </SView>

        </SView>
    );
}

const selectStyle = {
    background: "#1c1c1e",
    color: "#fff",
    border: "1px solid #3f3f3f",
    borderRadius: 4,
    padding: "4px 28px 4px 10px",
    fontSize: 12,
    fontWeight: "600",
    cursor: "pointer",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23aaa'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
};

const styles = StyleSheet.create({
    root: {
        backgroundColor: "#1c1c1e",
        minHeight: "100%",
    },
    videoWrap: {
        flex: 1,
        backgroundColor: "#000",
        position: "relative",
    },
    videoErrorOverlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    videoErrorText: {
        color: "#ff453a",
        fontSize: 15,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
    },
    videoErrorSub: {
        color: "#aaa",
        fontSize: 12,
        textAlign: "center",
    },
    timeBadge: {
        position: "absolute",
        bottom: 10,
        right: 12,
        backgroundColor: "rgba(0,0,0,0.55)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    timeBadgeText: {
        color: "#fff",
        fontSize: 13,
    },

    // ── Trimmer row ──────────────────────────────────────────────────
    trimmerBar: {
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 10,
        backgroundColor: "#2c2c2e",
        borderTopWidth: 1,
        borderTopColor: "#3a3a3c",
    },
    playBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    playBtnText: {
        fontSize: 20,
        color: "#fff",
    },

    // ── Filmstrip ────────────────────────────────────────────────────
    filmstrip: {
        flex: 1,
        height: STRIP_HEIGHT,
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        flexDirection: "row",
        backgroundColor: "#111",
        cursor: "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
    },
    framesLoading: {
        flex: 1,
        height: STRIP_HEIGHT,
        backgroundColor: "#2a2a2a",
    },
    dimOverlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        pointerEvents: "none",
    },
    selRailTop: {
        position: "absolute",
        top: 0,
        height: 4,
        backgroundColor: GOLD,
        pointerEvents: "none",
    },
    selRailBottom: {
        position: "absolute",
        bottom: 0,
        height: 4,
        backgroundColor: GOLD,
        pointerEvents: "none",
    },
    playhead: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: "#fff",
        borderRadius: 2,
        marginLeft: -1.5,
    },

    // ── Handles ──────────────────────────────────────────────────────
    handle: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: HANDLE_W,
        backgroundColor: GOLD,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 4,
        zIndex: 10,
    },
    handleLeft: {
        marginLeft: 0,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    handleRight: {
        marginLeft: -HANDLE_W,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    handleGrip: {
        width: 2.5,
        height: 14,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 2,
    },

    // ── Action buttons ───────────────────────────────────────────────
    actionBtns: {
        flexDirection: "column",
        gap: 6,
        flexShrink: 0,
    },
    trimBtn: {
        backgroundColor: "#0a84ff",
        borderRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: 7,
        alignItems: "center",
    },
    trimBtnText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
    },
    cancelBtn: {
        borderRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: 7,
        alignItems: "center",
        backgroundColor: "#3a3a3c",
    },
    cancelBtnText: {
        color: "#ccc",
        fontSize: 13,
    },

    // ── Info row ─────────────────────────────────────────────────────
    infoRow: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1c1c1e",
    },
    rangeText: {
        fontSize: 13,
        color: "#e0e0e0",
        fontWeight: "600",
    },
    durationText: {
        fontSize: 12,
        color: "#888",
        fontWeight: "normal",
    },
    selectWrap: {
        alignItems: "flex-end",
    },
});
