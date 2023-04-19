import {
  connectPlayground,
  installPlugin,
  login,
  PHPResponse,
  PlaygroundClient,
} from "./node_modules/@wp-playground/client/index.js";

function asDOM(response: PHPResponse) {
  return new DOMParser().parseFromString(response.text, "text/html")!;
}

async function createNewPost(
  client: PlaygroundClient,
  title: string,
  content: string,
  status = "publish"
) {
  try {
    const newPostResponse = await client.request({
      url: "/wp-admin/post-new.php",
    });
    const newPostPage = asDOM(newPostResponse);
    const el = newPostPage.querySelector("#wp-api-request-js-extra");
    const nonce = el?.textContent?.match(/"nonce":"([a-z0-9]*)"/)![1];

    const response = await client.request({
      method: "POST",
      url: "/index.php?rest_route=/wp/v2/posts",
      headers: {
        "Content-Type": "application/json",
        "X-WP-Nonce": nonce, // Use the nonce provided by WordPress
      },
      body: JSON.stringify({ title, content, status }),
    });

    const data = response.json;

    if (response.httpStatusCode >= 400) {
      throw new Error(data.message);
    } else {
      return data;
    }
  } catch (e) {
    console.error(e);
  }
}

(async () => {
  const client = await connectPlayground(document.querySelector("iframe")!, {
    loadRemote: "https://playground.wordpress.net/remote.html",
  });

  await client.isReady();
  await login(client, "admin", "password");

  const plugins = [
    "gutenberg.zip",
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
