import { ImageResponse } from "next/og";

export const runtime = "edge";
export const preferredRegion = "auto";

// const baseUrl = process.env.NEXT_PUBLIC_PERSONAL_URL
//   ? `https://${process.env.NEXT_PUBLIC_PERSONAL_URL}`
//   : "http://localhost:3001";

const baseUrl = "http://localhost:3000";

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Get car details from search params
  const make = searchParams.get("make") || "BMW";
  const model = searchParams.get("model") || "";
  const generation = searchParams.get("generation") || "";
  const years = searchParams.get("years") || "";
  const engineCode = searchParams.get("engineCode") || "";
  const power = searchParams.get("power") || "";
  const summary = searchParams.get("summary") || "";
  const trimmedSummary = summary
    ? summary.length > 200
      ? `${summary.slice(0, 200)}...`
      : summary
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          backgroundColor: "black",
          fontFamily: "Geist",
          letterSpacing: "-0.05em",
        }}
        tw="relative"
      >
        <div tw="flex w-full h-full absolute top-0 left-0 ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${baseUrl}/ob_background.jpg`}
            width="1000"
            height="500"
            alt="balls"
            tw="w-full h-full"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div
          tw="flex flex-col w-full h-full p-20 overflow-hidden"
          style={{
            display: "flex",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                fontSize: 32,
                color: "white",
                fontFamily: "Inter",
              }}
            >
              Know your Bimmer
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "40px",
              }}
            >
              {/* BMW Logo/Icon */}

              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: "scale(3)" }}
              >
                <rect width="24" height="24" />
                <path
                  d="M8.7123 7.51397C8.98844 7.51397 9.2123 7.29011 9.2123 7.01397C9.2123 6.73783 8.98844 6.51397 8.7123 6.51397L8.7123 7.51397ZM5.26095 10.8277L5.73787 7.9327L4.75117 7.77015L4.27425 10.6652L5.26095 10.8277ZM6.23122 7.51397L8.7123 7.51397L8.7123 6.51397L6.23122 6.51397L6.23122 7.51397ZM5.73787 7.9327C5.77766 7.69118 5.98645 7.51397 6.23122 7.51397L6.23122 6.51397C5.4969 6.51397 4.87054 7.04559 4.75117 7.77015L5.73787 7.9327Z"
                  fill="white"
                />
                <path
                  d="M10.6252 7.33378C10.6967 6.84226 11.1181 6.47771 11.6148 6.47771H17.5895C18.0932 6.47771 18.5182 6.85226 18.5816 7.35191L18.9912 10.5826H10.1527L10.6252 7.33378Z"
                  stroke="white"
                />
                <path
                  d="M6.72486 10.7464H3.93929C3.387 10.7464 2.93929 11.1942 2.93929 11.7464V14.3313C2.93929 14.8836 3.387 15.3313 3.93929 15.3313H6.66862"
                  stroke="white"
                  stroke-linecap="round"
                />
                <rect
                  x="8.37746"
                  y="10.5826"
                  width="12.4891"
                  height="5.04231"
                  rx="1"
                  stroke="white"
                />
                <circle cx="5.28613" cy="13.0389" r="0.872408" stroke="white" />
                <path
                  d="M9.92278 12.3966H12.1416"
                  stroke="white"
                  stroke-linecap="round"
                />
                <path
                  d="M19.2359 12.2834H16.836"
                  stroke="white"
                  stroke-linecap="round"
                />
                <path
                  d="M16.6273 15.6349V17.2992C16.6273 17.8515 17.0751 18.2992 17.6274 18.2992H17.9912C18.5435 18.2992 18.9912 17.8515 18.9912 17.2992V15.6349"
                  stroke="white"
                />
                <path
                  d="M10.0462 15.6349V17.2992C10.0462 17.8515 10.4939 18.2992 11.0462 18.2992H11.4101C11.9624 18.2992 12.4101 17.8515 12.4101 17.2992V15.6349"
                  stroke="white"
                />
                <path
                  d="M4.02063 15.3404V16.763C4.02063 17.3153 4.46834 17.763 5.02063 17.763H5.17006C5.72234 17.763 6.17006 17.3153 6.17006 16.763V15.3404"
                  stroke="white"
                />
              </svg>

              <div
                style={{
                  fontSize: 60,
                  fontWeight: 700,
                  color: "white",
                  display: "flex",
                }}
              >
                {make} {model}
              </div>
            </div>
          </div>

          {/* Car Details */}
          <div
            tw="text-white"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingTop: "20px",
            }}
          >
            {generation && (
              <div style={{ fontSize: 36, color: "white", display: "flex" }}>
                {generation} ({years})
              </div>
            )}
            {engineCode && (
              <div style={{ fontSize: 32, color: "white", display: "flex" }}>
                Engine: {engineCode} {power && `- ${power}`}
              </div>
            )}
            <div
              style={{
                fontSize: 24,

                maxWidth: "800px",
                overflow: "hidden",
                display: "flex",
                paddingTop: "20px",
              }}
            >
              {trimmedSummary}
            </div>
          </div>

          {/* Footer */}
          <div
            tw="text-white"
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              fontSize: 24,

              display: "flex",
            }}
          >
            know-your-bimmer.jineshb.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Geist",
          data: await loadGoogleFont(
            "Geist:wght@800",
            `${make} ${model} ${generation}`
          ),
          style: "normal",
        },
        {
          name: "Inter",
          data: await loadGoogleFont(
            "Inter:wght@400",
            `${engineCode} ${power} ${trimmedSummary}`
          ),
          style: "normal",
        },
      ],
    }
  );
}
