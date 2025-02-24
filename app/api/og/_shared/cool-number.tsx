import { formatNumber } from "../../../../lib/utils";

export const CoolNumber = ({ number, subtitle }: { number: number; subtitle: string }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid lightgray",
        borderRadius: "10%",
        padding: "20px",
        boxShadow: "5px 5px 5px lightgray",
      }}
    >
      <div
        style={{
          fontSize: 128,
          fontWeight: "bold",
          color: "darkblue",
          paddingBottom: "0px",
          marginBottom: "0px",
          lineHeight: 1,
        }}
      >
        {`${formatNumber(number)}`}
      </div>
      <div
        style={{
          fontSize: 20,
          color: "darkgray",
          paddingTop: "0px",
          marginTop: "0px",
          lineHeight: 1,
        }}
      >
        {`${subtitle}`}
      </div>
    </div>
  );
};
