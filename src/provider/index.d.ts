import type { DefineComponent, VNode, RendererNode, RendererElement, ComponentOptionsMixin, VNodeProps, AllowedComponentProps, ComponentCustomProps, ExtractPropTypes, PropType } from 'vue';
export declare const CProvider: DefineComponent<{
    size: {
        type: PropType<"mini" | "small" | "medium" | "large">;
        default: string;
    };
}, () => VNode<RendererNode, RendererElement, {
    [key: string]: any;
}>[], unknown, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, VNodeProps & AllowedComponentProps & ComponentCustomProps, Readonly<ExtractPropTypes<{
    size: {
        type: PropType<"mini" | "small" | "medium" | "large">;
        default: string;
    };
}>>, {
    size: "mini" | "small" | "medium" | "large";
}>;
