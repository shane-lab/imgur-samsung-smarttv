const useComputedStyles = window && window.getComputedStyle;

const transform = (key: string) => {
    if (!key) {
        return key;
    }

    return key.replace(/^-/, '').replace(/-([a-z])/g, capture => capture[1].toUpperCase());
}

const computedStyles = (node: HTMLElement, ...list: string[]): CSSStyleDeclaration => {
  if (!node) {
    return null;
  }

  let computed: CSSStyleDeclaration
  if (useComputedStyles) {
    computed = node.ownerDocument.defaultView.getComputedStyle(node, null);
  } else {
    computed = 'currentStyle' in node ? node['currentStyle'] : node.style;
  }

  const keys = list || (useComputedStyles ? computed : Object.keys(computed));
  
  const styles: any = { };

  for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = useComputedStyles ? computed.getPropertyValue(key) : computed[key];
      
      if (typeof value !== 'string') continue;

      styles[transform(key)] = value === '' ? 0 : value.match(/\d+/) ? parseFloat(value) : value;
  }

  return styles;
}

const computeStyle = (node: HTMLElement, style: string) => {
    const styles = computedStyles(node, style);

    return styles ? styles[transform(style)] : 0;
}

export {computeStyle, computedStyles}