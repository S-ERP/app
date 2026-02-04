import React from "react";
import { TextInputProps, TextInput, NativeSyntheticEvent, TextInputFocusEventData, View, FlatList } from "react-native";
import { SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import Config from "../../Config";
import SIconApp from "../../Assets/SIconApp";
type Option = {
    label: string;
    value: string;
    customComponent?: React.ReactNode;
    data?: any;
};
export type InputSelectorProps = {
    placeholder?: string;
    style?: TextInputProps["style"];
    options: Option[];
    value?: string;
    defaultValue?: string;
    required?: boolean;
    autoSelectOnBlur?: boolean;
    onCreate?: (value: string) => Promise<Option>;
    onSelect?: (option: Option) => void;
    onChangeText?: (text: string) => void;
}
export default class InputSelector extends React.Component<InputSelectorProps> {
    scrollListener: (() => void) | null = null;
    inputRef: any = null;
    popupElement: any = null;
    lastPosition = { pageX: 0, pageY: 0 };
    selectedValue: string = '';
    listContentRef: any = null;
    isSelecting: boolean = false;
    hasEditedValue: boolean = false;
    originalDisplayValue: string = '';
    state = {
        error: false,
        inputValue: this.props.value || this.props.defaultValue || '',
        displayValue: '',
        filteredOptions: this.props.options
    };
    componentDidMount() {
        // Inicializar displayValue con el label correspondiente al value o defaultValue inicial
        const initialValue = this.props.value || this.props.defaultValue;
        if (initialValue) {
            const option = this.props.options.find(opt => opt.value === initialValue);
            if (option) {
                this.originalDisplayValue = option.label ?? " ";
                this.setState({ displayValue: option.label ?? " " });
            } else {
                this.setState({ displayValue: initialValue });
            }
        }
    }
    getType() {
        return "custom";
    }
    getValue() {
        return this.state.inputValue;
    }
    setValue(value: string) {
        const option = this.props.options.find(opt => opt.value === value);
        if (option) {
            this.setState({
                inputValue: value,
                displayValue: option.label,
                error: false
            });
        } else {
            this.setState({
                inputValue: value,
                displayValue: ''
            });
        }
    }
    verify() {
        if (!this.props.required) return true;
        if (!this.getValue()) {
            this.setState({ error: true });
            return false;
        }
        this.setState({ error: false });
        return true;
    }
    matchesInData = (data: any, searchText: string): boolean => {
        if (!data) return false;
        const lowerSearch = searchText.toLowerCase();
        // Función recursiva para buscar en objetos y arrays
        const searchInValue = (value: any): boolean => {
            if (value === null || value === undefined) return false;
            if (typeof value === 'string') {
                return value.toLowerCase().includes(lowerSearch);
            }
            if (typeof value === 'number' || typeof value === 'boolean') {
                return String(value).toLowerCase().includes(lowerSearch);
            }
            if (Array.isArray(value)) {
                return value.some(item => searchInValue(item));
            }
            if (typeof value === 'object') {
                return Object.values(value).some(val => searchInValue(val));
            }
            return false;
        };
        return searchInValue(data);
    }
    handleChangeText = (text: string) => {
        // Marcar que el usuario ha editado el valor
        if (!this.hasEditedValue && text !== this.originalDisplayValue) {
            this.hasEditedValue = true;
        }
        // Solo filtrar si el usuario ha editado el valor original
        let filtered = this.props.options;
        if (this.hasEditedValue) {
            filtered = this.props.options.filter(option => {
                // const lowerText = text.toLowerCase();
                const lowerText = (text ?? "").toLowerCase();

                // Buscar en label y value
                const matchesLabelOrValue =
                    (option.label ?? "").toLowerCase().includes(lowerText) ||
                    (option.value ?? "").toLowerCase().includes(lowerText);

                // const matchesLabelOrValue =
                //     option.label.toLowerCase().includes(lowerText) ||
                //     option.value.toLowerCase().includes(lowerText);
                // Buscar en data si existe
                const matchesData = option.data ? this.matchesInData(option.data, text) : false;
                return matchesLabelOrValue || matchesData;
            });
        }
        // Agregar opción "Registrar..." si existe onCreate y hay texto
        const finalOptions = [...filtered];
        if (this.props.onCreate && text.trim() && this.hasEditedValue) {
            finalOptions.push({
                label: `+  Registrar "${text}"`,
                value: '__CREATE__',
                data: { createValue: text }
            });
        }
        this.setState({
            displayValue: text,
            filteredOptions: finalOptions,
            error: false
        });
        // Si el texto está vacío, limpiar inputValue
        if (!text) {
            this.setState({ inputValue: '' });
        }
        // Verificar si el item seleccionado aún existe en la lista filtrada
        const selectedStillExists = filtered.some(opt => opt.value === this.selectedValue);
        // Si el item seleccionado ya no está en la lista filtrada, seleccionar el primero
        if (!selectedStillExists && filtered.length > 0) {
            this.selectedValue = filtered[0].value;
            if (this.listContentRef) {
                this.listContentRef.updateSelection(this.selectedValue);
            }
        }
        // Actualizar la lista si el popup está abierto
        if (this.listContentRef) {
            this.listContentRef.updateOptions(finalOptions);
        }
        if (this.props.onChangeText) {
            this.props.onChangeText(text);
        }
    }
    updatePopupPosition = () => {
        if (!this.inputRef) return;
        this.inputRef.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
            // Si la posición cambió, actualizar el popup
            if (pageX !== this.lastPosition.pageX || pageY !== this.lastPosition.pageY) {
                this.lastPosition = { pageX, pageY };
                const popupHeight = 200;
                const spacing = 2;
                // @ts-ignore
                const windowHeight = window.innerHeight;
                const spaceBelow = windowHeight - (pageY + height);
                const spaceAbove = pageY;
                const showAbove = spaceBelow < popupHeight + spacing && spaceAbove > spaceBelow;
                const topPosition = showAbove
                    ? pageY - popupHeight - spacing
                    : pageY + height + spacing;
                // Actualizar posición del popup
                if (this.popupElement) {
                    this.popupElement.style.top = topPosition + 'px';
                    this.popupElement.style.left = pageX + 'px';
                }
            }
        });
    }
    handleKeyPress = (e: any) => {
        const { filteredOptions } = this.state;
        const key = e.nativeEvent.key;
        if (key === 'ArrowDown') {
            e.preventDefault();
            const currentIndex = filteredOptions.findIndex(opt => opt.value === this.selectedValue);
            if (currentIndex < filteredOptions.length - 1) {
                this.selectedValue = filteredOptions[currentIndex + 1].value;
                if (this.listContentRef) {
                    this.listContentRef.updateSelection(this.selectedValue);
                }
            }
        } else if (key === 'ArrowUp') {
            e.preventDefault();
            const currentIndex = filteredOptions.findIndex(opt => opt.value === this.selectedValue);
            if (currentIndex > 0) {
                this.selectedValue = filteredOptions[currentIndex - 1].value;
                if (this.listContentRef) {
                    this.listContentRef.updateSelection(this.selectedValue);
                }
            }
        } else if (key === 'Enter') {
            e.preventDefault();
            const selectedOption = filteredOptions.find(opt => opt.value === this.selectedValue);
            if (selectedOption) {
                this.selectOption(selectedOption);
            }
        }
    }
    registerAndSelect = async (createValue: string) => {
        if (!this.props.onCreate) return;
        const resp = await this.props.onCreate(createValue);
        this.setState({
            inputValue: resp.value,
            displayValue: resp.label,
            error: false
        });
        if (this.props.onSelect) {
            this.props.onSelect(resp);
        }
        if (this.props.onChangeText) {
            this.props.onChangeText(resp.value);
        }
        SPopup.close("InputSelector");
        this.removeScrollListener();
        if (this.inputRef) {
            this.inputRef.blur();
        }
        setTimeout(() => {
            this.isSelecting = false;
        }, 100);
    }
    selectOption = (option: Option) => {
        this.isSelecting = true;
        // Si es la opción de crear, ejecutar onCreate
        if (option.value === '__CREATE__' && this.props.onCreate) {
            const createValue = option.data?.createValue || this.state.displayValue;
            this.registerAndSelect(createValue);
            return;
        }
        // Actualizar el valor original y resetear el flag de edición
        this.originalDisplayValue = option.label;
        this.hasEditedValue = false;
        this.setState({
            inputValue: option.value,
            displayValue: option.label,
            error: false
        });
        if (this.props.onSelect) {
            this.props.onSelect(option);
        }
        SPopup.close("InputSelector");
        this.removeScrollListener();
        // Hacer blur del input
        if (this.inputRef) {
            this.inputRef.blur();
        }
        // Resetear el flag después de un momento
        setTimeout(() => {
            this.isSelecting = false;
        }, 100);
    }
    openPopup(pageX: number, pageY: number, width: number, height: number) {
        const popupHeight = 200;
        const spacing = 2;
        // @ts-ignore
        const windowHeight = window.innerHeight;
        // Calcular espacio disponible abajo y arriba
        const spaceBelow = windowHeight - (pageY + height);
        const spaceAbove = pageY;
        // Decidir si mostrar arriba o abajo
        const showAbove = spaceBelow < popupHeight + spacing && spaceAbove > spaceBelow;
        const topPosition = showAbove
            ? pageY - popupHeight - spacing
            : pageY + height + spacing;
        SPopup.open({
            key: "InputSelector",
            type: "3",
            content: <View
                ref={(ref) => this.popupElement = ref}
                style={{
                    position: "absolute",
                    top: topPosition,
                    left: pageX,
                    width: width,
                    height: popupHeight,
                    backgroundColor: STheme.color.background + "EE",
                    shadowColor: STheme.color.secondary,
                    shadowOpacity: 0.25,
                    shadowRadius: 4.84,
                    elevation: 5,
                    // @ts-ignore
                    backdropFilter: "blur(6px)", // Glass effect with blur
                    WebkitBackdropFilter: "blur(6px)", // For Safari support
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: STheme.color.card,
                }}
                // @ts-ignore
                onMouseDown={(e) => {
                    e.preventDefault();
                }}
            >
                <ListSelectorContent
                    ref={(ref) => this.listContentRef = ref}
                    options={this.state.filteredOptions}
                    totalOptions={this.props.options.length}
                    initialSelectedValue={this.selectedValue}
                    onSelect={this.selectOption}
                />
            </View>
        })
    }
    handleFocus(e: NativeSyntheticEvent<TextInputFocusEventData>) {
        // Resetear el flag de edición al hacer focus
        this.hasEditedValue = false;
        // Mostrar todas las opciones sin filtrar al hacer focus
        const finalOptions = [...this.props.options];
        this.setState({ filteredOptions: finalOptions });
        this.selectedValue = this.state.inputValue || this.props.options[0]?.value || '';
        (e.target as any).measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
            this.lastPosition = { pageX, pageY };
            // Agregar listener para detectar scroll y actualizar posición
            this.scrollListener = () => {
                this.updatePopupPosition();
            };
            // @ts-ignore
            window.addEventListener('scroll', this.scrollListener, true);
            this.openPopup(pageX, pageY, width, height);
        });
    }
    removeScrollListener() {
        if (this.scrollListener) {
            // @ts-ignore
            window.removeEventListener('scroll', this.scrollListener, true);
            this.scrollListener = null;
        }
        // this.inputRef = null;
        this.popupElement = null;
    }
    handleOnBlur(e: NativeSyntheticEvent<TextInputFocusEventData>) {
        // Si está en proceso de selección manual, no hacer autoselect
        if (this.isSelecting) {
            return;
        }
        // Buscar y seleccionar la primera opción que coincida solo si autoSelectOnBlur está habilitado
        const { filteredOptions } = this.state;
        if (this.props.autoSelectOnBlur && filteredOptions.length > 0 && !this.props.value) {
            // Si hay opciones filtradas, seleccionar la primera
            const firstOption = filteredOptions[0];
            this.setState({
                inputValue: firstOption.value,
                displayValue: firstOption.label,
                error: false
            });
            if (this.props.onSelect) {
                this.props.onSelect(firstOption);
            }
        } else if (!this.state.inputValue && !this.props.value) {
            // Si no hay coincidencias y no hay valor seleccionado, limpiar el display
            this.setState({ displayValue: '' });
        }
        SPopup.close("InputSelector");
        this.removeScrollListener();
    }
    componentWillUnmount() {
        this.removeScrollListener();
    }
    render() {
        const configInputs = Config.inputs()[this.props?.customStyle ?? "default"];
        const style: TextInputProps["style"] = {
            // paddingTop: 12,
            // ...configInputs.View,
            ...configInputs.InputText,
            flex: 1,
            width: "100%",
            outlineStyle: "none",
            margin: 0,
            paddingEnd: 20,
            // textAlignVertical: "center",
            // textAlign: "left",
            // height: 40,
            // justifyContent: "center"
        }
        return <>
            <TextInput
                {...this.props}
                value={(this.state.displayValue ?? "").replace("\n", " - ")}
                onChangeText={this.handleChangeText}
                onFocus={this.handleFocus.bind(this)}
                onBlur={this.handleOnBlur.bind(this)}
                onKeyPress={this.handleKeyPress.bind(this)}
                style={[style, this.props.style, this.state.error ? { borderColor: STheme.color.error, borderWidth: 1, } : {}]}
                ref={(ref) => this.inputRef = ref}
                selectTextOnFocus={!this.props.value}
                editable={!this.props.value}
            // numberOfLines={4}
            // multiline
            // numberOfLines={2}
            />
            <SView
                width={20}
                height={"100%"}
                center
                onPress={() => {
                    if (this.inputRef) {
                        this.inputRef.focus();
                    }
                }}
                style={{
                    transform: [{ rotate: "-90deg" }],
                    position: "absolute",
                    right: 0,
                    // @ts-ignore
                    userSelect: "none",
                    // pointerEvents: "none",
                    // @ts-ignore
                    outline: "none",
                    // @ts-ignore
                    tabIndex: -1
                }}
            >
                <SIconApp
                    name="Back"
                    fill={STheme.color.lightGray}
                    width={8}
                    draggable={false}
                    // @ts-ignore
                    style={{
                        userSelect: "none",
                        pointerEvents: "none"
                    }}
                />
            </SView>
        </>
    }
}
class ListSelectorContent extends React.Component<{
    options: Option[];
    totalOptions: number;
    initialSelectedValue: string;
    onSelect: (option: Option) => void;
}> {
    flatListRef = React.createRef<FlatList>();
    state = {
        selectedValue: this.props.initialSelectedValue,
        options: this.props.options
    };
    updateOptions(newOptions: Option[]) {
        this.setState({ options: newOptions });
    }
    updateSelection(newValue: string) {
        this.setState({ selectedValue: newValue }, () => {
            const newIndex = this.state.options.findIndex(opt => opt.value === newValue);
            if (this.flatListRef.current && newIndex >= 0) {
                try {
                    this.flatListRef.current.scrollToIndex({
                        index: newIndex,
                        animated: true,
                        viewPosition: 0.5
                    });
                } catch (e) {
                    console.log("Scroll error:", e);
                }
            }
        });
    }
    render() {
        const { onSelect, totalOptions } = this.props;
        const { selectedValue, options } = this.state;
        const visibleOptions = options.length;
        const hiddenOptions = totalOptions - visibleOptions;
        return <>
            {totalOptions > 0 && (
                <SView style={{
                    padding: 8,
                    // backgroundColor: STheme.color.card,
                    borderBottomWidth: 1,
                    borderBottomColor: STheme.color.card
                }}>
                    <SText style={{
                        fontSize: 8,
                        color: STheme.color.text + '80'
                    }}>
                        Mostrando {visibleOptions} de {totalOptions} {hiddenOptions > 0 ? `(${hiddenOptions} ocultos)` : ''}
                    </SText>
                </SView>
            )}
            <FlatList
                ref={this.flatListRef}
                data={options}
                keyExtractor={(item, index) => `${item.value}-${index}`}
                onScrollToIndexFailed={(info) => {
                    // Fallback si falla el scroll
                    setTimeout(() => {
                        this.flatListRef.current?.scrollToIndex({
                            index: info.index,
                            animated: true,
                            viewPosition: 0.5
                        });
                    }, 100);
                }}
                renderItem={({ item, index }) => {
                    const isSelected = item.value === selectedValue;
                    const isCreateOptionStyle = item.value === '__CREATE__' ? {
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                    } : {};
                    const isCreateOptionStyleText = item.value === '__CREATE__' ? {
                        // borderWidth: 1,
                        color: STheme.color.lightGray
                        // borderColor: STheme.color.card,
                    } : {};
                    return <View
                        style={{
                            padding: 8,
                            backgroundColor: isSelected ? STheme.color.card : 'transparent',
                            // @ts-ignore
                            cursor: 'pointer',
                            ...isCreateOptionStyle
                        }}
                        // @ts-ignore
                        onMouseDown={(e) => {
                            e.preventDefault();
                        }}
                        // @ts-ignore
                        onClick={() => onSelect(item)}
                    >
                        <SText style={{ color: STheme.color.text, ...isCreateOptionStyleText }}>{item.label}</SText>
                        {item.customComponent ? item.customComponent(item) : null}
                    </View>
                }}
            />
        </>
    }
}