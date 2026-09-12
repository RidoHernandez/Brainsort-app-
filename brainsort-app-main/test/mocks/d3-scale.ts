type Domain = [number, number];
type Range = [number, number];

export type ScaleLinear<Output = number, Unknown = never> = {
  (value: number): Output;
  domain(values?: Domain): ScaleLinear<Output, Unknown> | Domain;
  range(values?: Range): ScaleLinear<Output, Unknown> | Range;
};

export function scaleLinear(): ScaleLinear<number, never> {
  let currentDomain: Domain = [0, 1];
  let currentRange: Range = [0, 1];

  const scale = ((value: number) => {
    const [domainMin, domainMax] = currentDomain;
    const [rangeMin, rangeMax] = currentRange;
    const ratio =
      domainMax === domainMin ? 0 : (value - domainMin) / (domainMax - domainMin);

    return rangeMin + ratio * (rangeMax - rangeMin);
  }) as ScaleLinear<number, never>;

  scale.domain = (values?: Domain) => {
    if (!values) {
      return currentDomain;
    }

    currentDomain = values;
    return scale;
  };

  scale.range = (values?: Range) => {
    if (!values) {
      return currentRange;
    }

    currentRange = values;
    return scale;
  };

  return scale;
}
