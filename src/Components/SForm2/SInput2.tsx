import React, { forwardRef } from "react";
import { SText, STheme, SView } from "servisofts-component";
import { TextInput } from "react-native";


type SInput2Props = {
    name?: string;
    onChangeText?: (value: string) => void;
    defaultValue?: string;
    value?: string;
    style?: any;
    type?: "text" | "money";
    decimals?: number;
    icon?: React.ReactNode;
    iconR?: React.ReactNode;
    label?: string;
    labelStyle?: any;
    inputStyle?: any;
    bug?: boolean;
}

const SInput2 = forwardRef((props: SInput2Props, ref: React.Ref<SInput2Class>) => {
    return <SInput2Class ref={_ref => {
        if (ref) {
            if (typeof ref === "function") { ref(_ref); }
            else { (ref as any).current = _ref; }
        }
    }} {...props} />
})
export default SInput2;

// ─── Unified chronological undo stack ──────────────────────────────────────
//
// Every edit (text or money) is pushed to _undoStack in order.
// Ctrl+Z always pops the MOST RECENT entry regardless of type.
// This mirrors InputSelector's approach and handles the case where the user
// edits a text input, then a money input, and wants to undo both in order.

type UndoEntry =
    | { kind: 'money'; instance: SInput2Class; value: string; cursor: number }
    | { kind: 'text'; element: HTMLElement; prevValue: string };

const _undoStack: UndoEntry[] = [];

let _pendingTextPrev: { element: HTMLElement; value: string } | null = null;
let _applyingTextUndo = false;
let _moneyMountCount = 0;
let _focusedMoneyCount = 0;

// beforeinput (capture, document): capture prev value for text edits
// AND intercept historyUndo when we have tracked entries to restore.
function _onGlobalBeforeInput(e: any) {
    const t: any = e.target;
    if (!t || (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA')) return;
    if (_focusedMoneyCount > 0) return; // money's own _onBeforeInput handles it

    if (e.inputType === 'historyUndo') {
        const top = _undoStack[_undoStack.length - 1];
        if (!top) return; // nothing tracked — let browser undo natively
        e.preventDefault();
        _popUndo(false); // shouldFocusMoney=false: stay in current input
        return;
    }
    if (e.inputType === 'historyRedo') return;
    if (_applyingTextUndo) return;

    _pendingTextPrev = { element: t, value: t.value };
}

// input (capture, document): push text entry to stack after a change lands.
function _onGlobalInput(e: any) {
    const t: any = e.target;
    if (!t || (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA')) return;
    if (_focusedMoneyCount > 0) return;
    if (_applyingTextUndo) return;
    if (e.inputType === 'historyUndo' || e.inputType === 'historyRedo') {
        // Browser applied native undo we didn't intercept — keep stack in sync.
        const top = _undoStack[_undoStack.length - 1];
        if (top && top.kind === 'text') _undoStack.pop();
        _pendingTextPrev = null;
        return;
    }
    if (_pendingTextPrev && _pendingTextPrev.element === t) {
        _undoStack.push({ kind: 'text', element: t, prevValue: _pendingTextPrev.value });
        if (_undoStack.length > 200) _undoStack.shift();
    }
    _pendingTextPrev = null;
}

function _popUndo(shouldFocusMoney: boolean) {
    const entry = _undoStack.pop();
    if (!entry) return;
    if (entry.kind === 'text') {
        if (!(document as any).body.contains(entry.element)) return;
        entry.element.focus();
        // Use native value setter so React's onChange fires and updates state.
        const proto = entry.element.tagName === 'TEXTAREA'
            ? (window as any).HTMLTextAreaElement.prototype
            : (window as any).HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        if (nativeSetter) {
            _applyingTextUndo = true;
            nativeSetter.call(entry.element, entry.prevValue);
            entry.element.dispatchEvent(new Event('input', { bubbles: true }));
            _applyingTextUndo = false;
        }
    } else {
        entry.instance._applyUndoFromStack(entry.value, entry.cursor);
        if (shouldFocusMoney && entry.instance._inputRef) {
            entry.instance._inputRef.focus();
        }
    }
}

function _addListeners() {
    (document as any).addEventListener('beforeinput', _onGlobalBeforeInput, true);
    (document as any).addEventListener('input', _onGlobalInput, true);
}
function _removeListeners() {
    (document as any).removeEventListener('beforeinput', _onGlobalBeforeInput, true);
    (document as any).removeEventListener('input', _onGlobalInput, true);
}

// ─── Component ─────────────────────────────────────────────────────────────

export class SInput2Class extends React.Component<SInput2Props, {
    value: string;
    selection?: { start: number; end: number };
}> {
    state = {
        value: this.props.type === 'money'
            ? this.initMoney(this.props.defaultValue || '')
            : (this.props.defaultValue || ''),
        selection: undefined as { start: number; end: number } | undefined,
    }

    private _lastCursor = 0;
    private _lastSelectionEnd = 0;
    private _skipNextSelectionUpdate = false;
    _undoing = false;   // non-private: read by _applyUndoFromStack
    _isFocused = false; // non-private: read by _focusedMoneyCount guard
    _inputRef: any = null; // non-private: used by _popUndo for focus

    componentDidMount() {
        if (this.props.type === 'money') {
            _moneyMountCount++;
            if (_moneyMountCount === 1) _addListeners();
            (document as any).addEventListener('beforeinput', this._onBeforeInput, true);
            (document as any).addEventListener('keydown', this._onDocumentKeyDown, true);
        }
    }

    componentWillUnmount() {
        if (this.props.type === 'money') {
            (document as any).removeEventListener('beforeinput', this._onBeforeInput, true);
            (document as any).removeEventListener('keydown', this._onDocumentKeyDown, true);
            for (let i = _undoStack.length - 1; i >= 0; i--) {
                const e = _undoStack[i];
                if (e.kind === 'money' && e.instance === this) _undoStack.splice(i, 1);
            }
            _moneyMountCount--;
            if (_moneyMountCount === 0) {
                _removeListeners();
                _undoStack.length = 0;
                _pendingTextPrev = null;
                _focusedMoneyCount = 0;
            }
        }
    }

    // Fires for every document beforeinput in capture phase.
    // _onGlobalBeforeInput runs first (registered before this per componentDidMount order).
    // This handler only acts when THIS money instance has focus.
    _onBeforeInput = (e: any) => {
        if (!this._isFocused) return;
        if (e.inputType !== 'historyUndo') return;
        e.preventDefault();
        if (!this._undoing) _popUndo(false); // money focused — don't steal focus after undo
    }

    // Not-focused Ctrl+Z (no editable element active).
    // Uses stopImmediatePropagation so only ONE money instance handles the event:
    // — for money entries: only the owning instance proceeds (instance check)
    // — for text entries:  first instance to reach here handles it (stopImmediate)
    _onDocumentKeyDown = (e: any) => {
        if (this._isFocused) return;
        if (!(e.ctrlKey || e.metaKey) || e.key !== 'z') return;

        const active: any = (document as any).activeElement;
        const activeIsEditable = active &&
            (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
            !active.readOnly && !active.disabled;
        if (activeIsEditable) return;

        const top = _undoStack[_undoStack.length - 1];
        if (!top) return;
        if (top.kind === 'money' && top.instance !== this) return;

        e.preventDefault();
        e.stopImmediatePropagation();
        _popUndo(true); // not focused — focus money after undoing a money entry
    }

    getValue() {
        if (this.props.type === 'money') {
            const { integer, decimal } = this.parseMoneyText(this.state.value);
            const rawInt = parseInt(integer || '0', 10) || 0;
            return decimal != null && decimal !== '' ? `${rawInt}.${decimal}` : rawInt.toString();
        }
        return this.state.value;
    }

    setValue(raw: number | string) {
        const rawStr = String(raw ?? '');
        const formatted = this.props.type === 'money' ? this.initMoney(rawStr) : rawStr;
        this.setState({ value: formatted });
        if (this.props.onChangeText) {
            this.props.onChangeText(rawStr);
        }
    }

    // Called by _popUndo when undoing a money entry from outside the instance.
    _applyUndoFromStack(value: string, cursor: number) {
        const c = Math.min(cursor, value.length);
        this._undoing = true;
        this._skipNextSelectionUpdate = true;
        this.setState({ value, selection: { start: c, end: c } }, () => {
            this._undoing = false;
        });
        if (this.props.onChangeText) {
            const { integer, decimal } = this.parseMoneyText(value);
            const rawInt = parseInt(integer || '0', 10) || 0;
            const raw = decimal != null && decimal !== '' ? `${rawInt}.${decimal}` : rawInt.toString();
            this.props.onChangeText(raw);
        }
    }

    private initMoney(raw: string): string {
        if (!raw) return '';
        const rawStr = String(raw);
        const maxDec = this.props.decimals ?? 2;
        const dotIdx = rawStr.indexOf('.');
        const intStr = parseInt(rawStr, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        if (dotIdx === -1) return intStr;
        const dec = rawStr.substring(dotIdx + 1).substring(0, maxDec);
        return `${intStr},${dec}`;
    }

    private parseMoneyText(text: string): { integer: string; decimal: string | null } {
        const maxDec = this.props.decimals ?? 2;
        if (!text) return { integer: '', decimal: null };
        if (text.includes(',')) {
            const stripped = text.replace(/\./g, '');
            const commaIdx = stripped.indexOf(',');
            const integer = stripped.substring(0, commaIdx).replace(/\D/g, '') || '0';
            const decimal = stripped.substring(commaIdx + 1).replace(/\D/g, '').substring(0, maxDec);
            return { integer, decimal };
        }
        const integer = text.replace(/\./g, '').replace(/\D/g, '');
        return { integer: integer || '0', decimal: null };
    }

    private formatMoney(integer: string, decimal: string | null): string {
        if (!integer) return '';
        const intNum = parseInt(integer, 10);
        const intStr = (isNaN(intNum) ? 0 : intNum).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        if (decimal === null) return intStr;
        return `${intStr},${decimal}`;
    }

    private hasExtraDot(newText: string, oldFormatted: string): boolean {
        if (oldFormatted.includes(',')) return false;
        const digits = newText.replace(/\D/g, '');
        if (!digits) return false;
        const expectedDots = Math.floor((digits.length - 1) / 3);
        const actualDots = (newText.match(/\./g) || []).length;
        return actualDots > expectedDots;
    }

    private countMeaningfulBefore(text: string, cursor: number): number {
        let count = 0;
        for (let i = 0; i < cursor && i < text.length; i++) {
            if (text[i] !== '.') count++;
        }
        return count;
    }

    private findCursorAfterMeaningful(text: string, n: number): number {
        if (n <= 0) return 0;
        let seen = 0;
        for (let i = 0; i < text.length; i++) {
            if (text[i] !== '.') {
                seen++;
                if (seen >= n) return i + 1;
            }
        }
        return text.length;
    }

    private pushUndo(value: string, cursor: number) {
        _undoStack.push({ kind: 'money', instance: this, value, cursor });
        if (_undoStack.length > 200) _undoStack.shift();
    }

    onSelectionChange = (e: any) => {
        this._lastCursor = e.nativeEvent.selection.start;
        this._lastSelectionEnd = e.nativeEvent.selection.end;
        if (this._skipNextSelectionUpdate) {
            this._skipNextSelectionUpdate = false;
            this.setState({ selection: undefined });
        }
    }

    onChangeText(text: string) {
        if (this._undoing) return;

        if (this.props.type === 'money') {
            const oldFormatted = this.state.value;
            const isAdding = text.length > oldFormatted.length;

            if (isAdding && !text.includes(',') && this.hasExtraDot(text, oldFormatted)) {
                const integer = text.replace(/\./g, '').replace(/\D/g, '') || '0';
                const newFormatted = this.formatMoney(integer, '');
                const commaIdx = newFormatted.indexOf(',');
                const newCursor = commaIdx !== -1 ? commaIdx + 1 : newFormatted.length;
                this.pushUndo(oldFormatted, this._lastCursor);
                this._skipNextSelectionUpdate = true;
                this.setState({ value: newFormatted, selection: { start: newCursor, end: newCursor } });
                if (this.props.onChangeText) this.props.onChangeText(parseInt(integer, 10).toString());
                return;
            }

            const { integer, decimal } = this.parseMoneyText(text);
            const newFormatted = this.formatMoney(integer, decimal);

            let newCursor: number;
            const switchedToDecimal = isAdding && text.includes(',') && !oldFormatted.includes(',');
            const hadSelection = this._lastSelectionEnd > this._lastCursor;
            const isReplaceSelection = !isAdding && hadSelection && text.length > 0;

            if (isReplaceSelection) {
                newCursor = newFormatted.length;
            } else if (switchedToDecimal) {
                const commaIdx = newFormatted.indexOf(',');
                newCursor = commaIdx !== -1 ? commaIdx + 1 : newFormatted.length;
            } else if (isAdding) {
                const meaningful = this.countMeaningfulBefore(oldFormatted, this._lastCursor);
                newCursor = this.findCursorAfterMeaningful(newFormatted, meaningful + 1);
            } else {
                const deletedChar = this._lastCursor > 0 ? oldFormatted[this._lastCursor - 1] : '';
                const meaningful = this.countMeaningfulBefore(oldFormatted, this._lastCursor);
                const target = deletedChar !== '.' && deletedChar !== '' ? Math.max(0, meaningful - 1) : meaningful;
                newCursor = this.findCursorAfterMeaningful(newFormatted, target);
            }

            this.pushUndo(oldFormatted, this._lastCursor);
            this._skipNextSelectionUpdate = true;
            this.setState({ value: newFormatted, selection: { start: newCursor, end: newCursor } });

            if (this.props.onChangeText) {
                const rawInt = parseInt(integer || '0', 10) || 0;
                const raw = decimal != null && decimal !== '' ? `${rawInt}.${decimal}` : rawInt.toString();
                this.props.onChangeText(raw);
            }
        } else {
            this.setState({ value: text });
            if (this.props.onChangeText) this.props.onChangeText(text);
        }
    }

    render() {
        const { type, decimals, name, defaultValue, onChangeText: _, value: _v, style, icon, iconR, label, labelStyle, inputStyle, bug, ...rest } = this.props;
        const hasWrapper = !!(icon || iconR || label);
        const d = bug ? { borderWidth: 1, borderColor: "pink" } as any : null;
        const textInput = <TextInput
            keyboardType={type === 'money' ? 'numeric' : 'default'}
            {...rest}
            ref={(r) => { this._inputRef = r; }}
            value={this.state.value}
            selection={type === 'money' ? this.state.selection : undefined}
            onSelectionChange={type === 'money' ? this.onSelectionChange : undefined}
            onFocus={(e) => {
                if (type === 'money') { this._isFocused = true; _focusedMoneyCount++; }
                if ((rest as any).onFocus) (rest as any).onFocus(e);
            }}
            onBlur={(e) => {
                if (type === 'money') { this._isFocused = false; _focusedMoneyCount = Math.max(0, _focusedMoneyCount - 1); }
                if ((rest as any).onBlur) (rest as any).onBlur(e);
            }}
            onChangeText={this.onChangeText.bind(this)}
            style={[
                { outline: "none", fontSize: 12, color: STheme.color.text } as any,
                hasWrapper ? { flex: 1, height: "100%" } as any : null,
                icon ? { paddingRight: 2, textAlign: "right" } as any : { paddingLeft: 4 } as any,
                inputStyle,
                d,
            ]}
        />;

        if (!hasWrapper) return textInput;

        const withLines = (node: React.ReactNode) =>
            React.isValidElement(node) ? React.cloneElement(node as any, { numberOfLines: 1 }) : node;

        return (
            <SView row style={[{ flex: 1, height: "100%", position: "relative" } as any, style, d]} backgroundColor={STheme.color.card}>
                {label && (
                    <SText width={"100%"} style={{ position: "absolute", top: -3, fontSize: 9, color: STheme.color.lightGray, backgroundColor: STheme.color.background + "99", paddingHorizontal: 3, zIndex: 2, whiteSpace: "nowrap", borderRadius: 3, ...labelStyle, ...(bug ? { borderWidth: 1, borderColor: "pink" } : {}) } as any}> {label} </SText>
                )}
                {icon && <SView center style={[{ height: "100%", paddingLeft: 3 }, d]}>{withLines(icon)}</SView>}
                <SView flex height style={d}>{textInput}</SView>
                {iconR && <SView center style={[{ height: "100%", paddingRight: 3 }, d]}>{withLines(iconR)}</SView>}
            </SView>
        );
    }
}

type SMoneyInputProps = Omit<SInput2Props, 'type'> & {
    icon?: React.ReactNode;
    iconR?: React.ReactNode;
};

export class SMoneyInput extends React.Component<SMoneyInputProps> {
    private _ref: SInput2Class | null = null;

    componentDidMount() {
        if (this.props.defaultValue) {
            this._ref?.setValue(this.props.defaultValue);
        }
    }

    getType() { return 'money'; }
    getValue() { return this._ref?.getValue() ?? ''; }
    setValue(v: string) { this._ref?.setValue(v); }
    verify() { return true; }
    focus() { this._ref?._inputRef?.focus(); }

    render() {
        const { icon, iconR, ...rest } = this.props;
        const inputStyle = [
            { flex: 1, height: "100%", textAlign: icon ? "right" : "left", paddingRight: 4 },
            rest.style,
        ] as any;
        return (
            <>
                {icon && <SView center style={{ height: "100%" }}>{icon}</SView>}
                <SView flex height>
                    <SInput2Class ref={r => { this._ref = r; }} {...rest} type="money" style={inputStyle} />
                </SView>
                {iconR && <SView center style={{ height: "100%" }}>{iconR}</SView>}
            </>
        );
    }
}
