import type { ComputedRef } from 'vue';
import type { Sizes } from '../_types';
declare type SizesClassName = `carbons-${Sizes}`;
export declare function useSize(props: {
    size: Sizes;
}): ComputedRef<SizesClassName>;
export {};
