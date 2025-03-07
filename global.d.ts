declare module "*.css?url" {
	const content: string;
	export default content;
}

declare module "relative";

import { FlexProps as OriginalFlexProps, BoxProps as OriginalBoxProps } from "@react-three/flex";

type OptionalFlexProps = {
    [P in keyof OriginalFlexProps]?: OriginalFlexProps[P];
};

type OptionalBoxProps = {
    [P in keyof OriginalBoxProps]?: OriginalBoxProps[P];
};

declare module "@react-three/flex" {
    export const Flex: React.ComponentType<OptionalFlexProps>;
    export const Box: React.ComponentType<OptionalBoxProps>;
}