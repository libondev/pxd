import type { DefineComponent, ComponentOptionsMixin, VNodeProps, AllowedComponentProps, ComponentCustomProps, ExtractPropTypes, PropType } from 'vue';
export declare const CIcon: DefineComponent<{
    size: {
        type: PropType<`${number}px` | `${number}rem` | `${number}em` | `${number}vw` | `${number}vh` | `${number}vmin` | `${number}vmax`>;
        default: null;
    };
    color: {
        type: StringConstructor;
        default: null;
    };
}, () => JSX.Element, unknown, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, VNodeProps & AllowedComponentProps & ComponentCustomProps, Readonly<ExtractPropTypes<{
    size: {
        type: PropType<`${number}px` | `${number}rem` | `${number}em` | `${number}vw` | `${number}vh` | `${number}vmin` | `${number}vmax`>;
        default: null;
    };
    color: {
        type: StringConstructor;
        default: null;
    };
}>>, {
    size: `${number}px` | `${number}rem` | `${number}em` | `${number}vw` | `${number}vh` | `${number}vmin` | `${number}vmax`;
    color: string;
}>;
