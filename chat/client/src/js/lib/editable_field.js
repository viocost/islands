import * as util from "./dom-util";

export function bakeEditableField(placeholder, userClasses){
    let classes = ["editable-field"]
    if (userClasses !== undefined){
        classes = classes.concat(userClasses)
    }

    return  util.bake("input", {classes: classes, attributes:{
            type: "text",
            placeholder: placeholder ? placeholder : ""
        }});

}