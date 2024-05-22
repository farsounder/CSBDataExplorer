import React from "react";
import { ImageResponse } from "next/og";
import { getPlatformData } from "../../../../services/noaa";

import Seabed2030Logo from "../../../../components/icons/seabed";
import NoaaLogo from "../../../../components/icons/noaalogo";
import FSLogo from "../../../../components/icons/fslogo";

// This is just estimated based on some recent submissions size vs number of
// of depth points
const bytesToDepthPoints = (bytes: number) => Math.round(bytes * 0.0025);

const timeWindowValid = (
  minDays: number,
  maxDays: number,
  time_window_days: number
): boolean => {
  return time_window_days >= minDays && time_window_days <= maxDays;
};

// format number great then a million to 1.2M, etc
const formatNumber = (num: number): string => {
  if (num > 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return `${num}`;
};

const CoolNumber = ({
  number,
  subtitle,
}: {
  number: number;
  subtitle: string;
}) => {
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

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { noaa_id: string };
  }
) {
  if (!params.noaa_id) {
    return new Response("no id provided", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const time_window_days = Number(searchParams.get("time_window_days")) || 30;

  const data = await getPlatformData({
    noaa_id: params.noaa_id,
    time_window_days: time_window_days,
  });

  if (!timeWindowValid(0, 365, time_window_days)) {
    return new Response(
      "Time window out of range, should be between 0 and 365 days",
      { status: 404 }
    );
  }

  const noData = !data || data.length === 0;
  const provider = noData ? "No Data" : data[0].provider;
  const total_data_size = data.reduce((acc, d) => d.dataSize + acc, 0);

  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            textAlign: "center",
            alignItems: "center",
            flexDirection: "column",
            paddingTop: "20px",
            backgroundColor: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          ></div>
          <div
            style={{
              fontSize: 60,
              fontStyle: "normal",
              letterSpacing: "-0.025em",
              color: "gray",
              lineHeight: 1.0,
              whiteSpace: "pre-wrap",
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "350px",
              paddingLeft: "50px",
              paddingRight: "50px",
              paddingBottom: "20px",
              paddingTop: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                paddingBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  height: "100px",
                  color: "darkblue",
                  fontWeight: "bold",
                  padding: "0px",
                  margin: "0px",
                  lineHeight: 1.0,
                }}
              >
                My Contributions
              </div>
              <div
                style={{
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                {`Data contributed via ${provider} for the last ${time_window_days} on my platform`}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <CoolNumber
                number={time_window_days}
                subtitle="day time window"
              />
              <CoolNumber
                number={total_data_size}
                subtitle="approximate bytes of data"
              />
              <CoolNumber
                number={bytesToDepthPoints(total_data_size)}
                subtitle="approximate depth measurements"
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "225px",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingLeft: "50px",
              paddingRight: "50px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "darkgray",
                width: "200px",
              }}
            >
              Data from DCDB/NCEI
              <div
                style={{
                  paddingLeft: "40px",
                  display: "flex",
                }}
              >
                <NoaaLogo />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "darkgray",
              }}
            >
              App hosted by
              <FSLogo width={"200px"} />
              <div
                style={{
                  display: "flex",
                  whiteSpace: "pre-wrap",
                }}
              >
                learn more at{" "}
                <span
                  style={{
                    textDecoration: "underline",
                    fontStyle: "italic",
                  }}
                >
                  mycsb.farsounder.com
                </span>
              </div>
            </div>
            <Seabed2030Logo width={"150px"} />
            <img
              src="https://mycsb.farsounder.com/iho-csb-logo.png"
              width="275px"
            />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
