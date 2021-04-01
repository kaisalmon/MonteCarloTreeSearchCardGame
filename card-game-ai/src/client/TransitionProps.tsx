import React, {useEffect, useState} from "react";
type GetComponentProps<T> = T extends React.ComponentType<infer P> | React.Component<infer P> ? P : never

type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];
type TransitionPropsProps<X extends Record<string, unknown>> = {
    component: (props:X)=>JSX.Element,
    propList:KeysMatching<X, number>[]
} & X

function TransitionProps<X extends Record<string, unknown>>({
            component,
           propList,
           ...rest
}:TransitionPropsProps<X>):JSX.Element {
  const [visibleProps, setVisibleProps] = useState(rest);

  useEffect(() => {
    requestAnimationFrame(() => {
      const newVisibleProps:any = {};
      for (let key of propList) {
        const currentValue = visibleProps[key as string] as number;
        const targetValue = rest[key as string] as number;
        const diff = targetValue - currentValue;
        const newValue = currentValue + diff/20;
        newVisibleProps[key] = newValue;
      }
      setVisibleProps(newVisibleProps);
    });
  }, [rest, visibleProps]);

  return component({...rest as any, ...visibleProps});
};

export default TransitionProps;