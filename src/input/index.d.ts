import type { DefineComponent, ComponentOptionsMixin, VNodeProps, AllowedComponentProps, ComponentCustomProps, ExtractPropTypes, PropType } from 'vue';
export declare const CInput: DefineComponent<{
    /**
     * @zh 输入框值
     */
    modelValue: {
        type: (StringConstructor | NumberConstructor)[];
        default: string;
    };
    /**
     * @zh 输入框尺寸
     */
    size: {
        type: PropType<"mini" | "small" | "medium" | "large">;
        default: string;
    };
    /**
     * @zh 禁用
     */
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 只读
     */
    readonly: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 是否移除展示省略号
     */
    ellipsis: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 是否可以清空
     */
    clearable: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 自定义提示语
     */
    placeholder: {
        type: StringConstructor;
        default: string;
    };
}, () => JSX.Element, unknown, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, VNodeProps & AllowedComponentProps & ComponentCustomProps, Readonly<ExtractPropTypes<{
    /**
     * @zh 输入框值
     */
    modelValue: {
        type: (StringConstructor | NumberConstructor)[];
        default: string;
    };
    /**
     * @zh 输入框尺寸
     */
    size: {
        type: PropType<"mini" | "small" | "medium" | "large">;
        default: string;
    };
    /**
     * @zh 禁用
     */
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 只读
     */
    readonly: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 是否移除展示省略号
     */
    ellipsis: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 是否可以清空
     */
    clearable: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 自定义提示语
     */
    placeholder: {
        type: StringConstructor;
        default: string;
    };
}>>, {
    size: "mini" | "small" | "medium" | "large";
    disabled: boolean;
    modelValue: string | number;
    readonly: boolean;
    ellipsis: boolean;
    clearable: boolean;
    placeholder: string;
}>;
