import React from 'react';
import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup } from 'servisofts-component';
import Model from '../../Model';
import TextAreaPopupOpenIcon from '../../Components/QueryTool/TextAreaPopupOpenIcon';

class index extends DPA.edit {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: []
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk);
    }

    $inputs() {
        const inpust = super.$inputs();
        inpust.ia_info.type = "textArea";
        inpust.ia_info.iconR = <TextAreaPopupOpenIcon
            type={"MD"}
            title='IA Info'
            getDefaultValue={() => {
                
                return this.form?.getValues()?.ia_info;
            }}
            onChangeText={(text: string) => {
                if (this.form) {
                    this.form.setValues({ "ia_info": text });
                }
            }} />
        return inpust;
    }
    $onSubmit(data) {
        Parent.model.Action.editar({
            data: {
                ...this.data,
                ...data
            },
            key_empresa: this.data?.key,
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);

        })
    }
}

export default connect(index);