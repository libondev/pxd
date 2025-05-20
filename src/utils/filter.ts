// https:// github.com/vueuse/vueuse/blob/main/packages/shared/utils/is.ts#L5
export const notNullish = <T>(value: T): value is NonNullable<T> => value != null
