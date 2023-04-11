import {
  connectPlayground,
  installPlugin,
  login,
  PHPResponse,
  PlaygroundClient,
} from "./node_modules/@wp-playground/client/index.js";

function asText(response: PHPResponse) {
  return new TextDecoder().decode(response.body);
}

function asDOM(response: PHPResponse) {
  return new DOMParser().parseFromString(asText(response), "text/html")!;
}

async function createNewPost(
  client: PlaygroundClient,
  title: string,
  content: string,
  status = "publish"
) {
  try {
    const newPostResponse = await client.request({
      relativeUrl: "/wp-admin/post-new.php",
    });
    const newPostPage = asDOM(newPostResponse);
    const el = newPostPage.querySelector("#wp-api-request-js-extra");
    const nonce = el?.textContent?.match(/"nonce":"([a-z0-9]*)"/)![1];
    const url = await client.absoluteUrl;

    console.log(`${url}?rest_route=/wp/v2/posts`);
    const response = await fetch(`${url}?rest_route=/wp/v2/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WP-Nonce": nonce, // Use the nonce provided by WordPress
      },
      mode: "no-cors",
      body: JSON.stringify({ title, content, status }),
      credentials: "include", // Include cookies for authentication
    });

    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (e) {
    console.error(e);
  }
}

(async () => {
  const client = await connectPlayground(
    document.querySelector("iframe")!,
    "https://playground.wordpress.net/remote.html"
  );

  await client.isReady();
  await login(client, "admin", "password");

  const plugins = [
    "gutenberg.zip",
    "cors-enabler.zip",
    "block-interactivity-experiments.zip",
    "hello.zip",
  ];

  for (const plugin of plugins) {
    const pluginResponse = await fetch(`zips/${plugin}`);
    const blob = await pluginResponse.blob();
    const pluginFile = new File([blob], plugin);
    await installPlugin(client, pluginFile);
  }

  const data = await createNewPost(client, "Test post", "hello");

  console.log(data);

  await client.goTo("/wp-admin/edit.php");

  console.log("done");
})();
