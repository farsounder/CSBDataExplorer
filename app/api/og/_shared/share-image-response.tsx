import { ImageResponse } from "next/og";
import { CoolNumber } from "./cool-number";

import Seabed2030Logo from "../../../../components/icons/seabed";
import NoaaLogo from "../../../../components/icons/noaalogo";
import FSLogo from "../../../../components/icons/fslogo";
import { bytesToDepthPoints } from "../../../../lib/utils";

export const shareImageResponse = ({
  dataLength,
  timeWindowDays,
  totalDataSize,
  provider,
}: {
  dataLength: number;
  timeWindowDays: number;
  totalDataSize: number;
  provider: string;
}) => (
  new ImageResponse(
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
                {`Data contributed via ${provider} for the last ${timeWindowDays} days on my platform`}
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
                number={dataLength}
                subtitle={`of ${timeWindowDays} days with data`}
              />
              <CoolNumber
                number={totalDataSize}
                subtitle="approximate bytes of data"
              />
              <CoolNumber
                number={bytesToDepthPoints(totalDataSize)}
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
              This app hosted by
              <FSLogo width="314px" height="50px" />
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
              alt="IHO CSB Logo"
            />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  );