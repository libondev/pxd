import type { DefineComponent, ComponentOptionsMixin, VNodeProps, AllowedComponentProps, ComponentCustomProps, ExtractPropTypes, PropType } from 'vue';
import type { NativeButton, VariantState } from '../_types';
export declare const CButton: DefineComponent<{
    /**
     * @zh Button 变体，主要用于区分不同的状态
     */
    status: {
        type: PropType<"default" | "primary" | "warning" | "danger">;
        default: string;
        validator: (value: VariantState) => boolean;
    };
    /**
     * @zh 按钮的原生类型
     */
    type: {
        type: PropType<"button" | "submit" | "reset">;
        default: string;
        validator: (value: NativeButton) => boolean;
    };
    /**
     * @zh 按钮的尺寸
     */
    size: {
        type: PropType<"mini" | "small" | "medium" | "large">;
        default: string;
    };
    /**
     * @zh 朴素按钮
     */
    plain: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 幽灵按钮，无边框、背景色
     */
    ghost: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 是否处于加载中
     */
    loading: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 禁用按钮
     */
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 是否启用聚焦样式
     */
    focusable: {
        type: BooleanConstructor;
        default: boolean;
    };
}, () => JSX.Element, unknown, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, "click"[], "click", VNodeProps & AllowedComponentProps & ComponentCustomProps, Readonly<ExtractPropTypes<{
    /**
     * @zh Button 变体，主要用于区分不同的状态
     */
    status: {
        type: PropType<"default" | "primary" | "warning" | "danger">;
        default: string;
        validator: (value: VariantState) => boolean;
    };
    /**
     * @zh 按钮的原生类型
     */
    type: {
        type: PropType<"button" | "submit" | "reset">;
        default: string;
        validator: (value: NativeButton) => boolean;
    };
    /**
     * @zh 按钮的尺寸
     */
    size: {
        type: PropType<"mini" | "small" | "medium" | "large">;
        default: string;
    };
    /**
     * @zh 朴素按钮
     */
    plain: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 幽灵按钮，无边框、背景色
     */
    ghost: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 是否处于加载中
     */
    loading: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 禁用按钮
     */
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * @zh 是否启用聚焦样式
     */
    focusable: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & {
    onClick?: ((...args: any[]) => any) | undefined;
}, {
    status: "default" | "primary" | "warning" | "danger";
    type: "button" | "submit" | "reset";
    size: "mini" | "small" | "medium" | "large";
    plain: boolean;
    ghost: boolean;
    loading: boolean;
    disabled: boolean;
    focusable: boolean;
}>;
