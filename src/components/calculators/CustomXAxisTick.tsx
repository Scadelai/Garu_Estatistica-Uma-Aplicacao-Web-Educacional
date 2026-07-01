

export const CustomXAxisTick = ({ x, y, payload }: any) => {
  if (!payload || typeof payload.value !== 'string') {
    return (
      <g transform={`translate(${x},${y + 1})`}>
        <text x={0} y={0} dy={0} textAnchor="middle" fill="#666" fontSize={11}>
          {payload?.value}
        </text>
      </g>
    );
  }

  // Split label into words. If it's a single huge word, it will just render as one line.
  const words = payload.value.split(' ');

  return (
    <g transform={`translate(${x},${y + 1})`}>
      <text x={0} y={0} dy={0} textAnchor="middle" fill="#333" fontSize={11}>
        {words.map((word: string, index: number) => (
          <tspan x={0} dy={index === 0 ? 10 : 14} key={index}>
            {word}
          </tspan>
        ))}
      </text>
    </g>
  );
};
