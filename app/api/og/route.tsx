import { ImageResponse } from "next/og";

export const runtime = "edge";
export const preferredRegion = "auto"; // Optional: helps with edge function deployment

// App router includes @vercel/og.
// No need to install it.

// const webSiteUrl = "http://localhost:3000";
// const newSiteUrl = "localhost:3000";

// const newUrl = process.env.PERSONAL_URL ? process.env.PERSONAL_URL : newSiteUrl;

const baseUrl = process.env.NEXT_PUBLIC_PERSONAL_URL
  ? `https://${process.env.NEXT_PUBLIC_PERSONAL_URL}`
  : "http://localhost:3001"; // Default to localhost if running locally

console.log("@@baseUrl", baseUrl);

// const image = fetch(new URL(`${baseUrl}/og_bg.png`)).then((res) =>
//   res.arrayBuffer()
// );

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

export async function GET() {
  const know = "Know your";
  const bimmer = "Bimmer";
  const technical = "Technical Specifications & Performance Data";
  const explore = "Explore Engine Classes, Configurations & Car Models";
  const website = "jineshb.me";
  // const ogBgImage = readFileSync(join(process.cwd(), "public/og_bg.png"));

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
        <div tw="flex flex-col w-full h-full p-24 gap-10">
          <div
            style={{
              width: "100%",
              fontSize: "120",
              color: "white",
              fontFamily: "Geist",
              letterSpacing: "-0.05em",
              lineHeight: "1",
            }}
            tw="flex flex-col w-2/3 h-full"
          >
            {know}

            <span>{bimmer}</span>
            <div
              style={{
                width: "100%",
                fontSize: 42,
                fontFamily: "Inter",
                color: "white",
                paddingBottom: "16px",
                letterSpacing: "-0.02em",
                paddingTop: "10px",
              }}
            >
              {technical}
            </div>
          </div>

          <div
            style={{
              width: "100%",
              fontSize: 30,
              fontFamily: "Inter",
              color: "white",
            }}
          >
            {explore}
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
          data: await loadGoogleFont("Geist:wght@800", know + bimmer),
          style: "normal",
        },
        {
          name: "Inter",
          data: await loadGoogleFont(
            "Inter:wght@400",
            technical + explore + website
          ),
          style: "normal",
        },
      ],
    }
  );
}
