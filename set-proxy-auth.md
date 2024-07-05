# How to set proxy auth

**TL;DR**

Majority of libraries appear to support auth in url via `HTTP_PROXY` and `HTTPS_PROXY` envs. For those that don;t we can either swap them out for ones that do or parse the url supplied via `HTTP_PROXY` and `HTTPS_PROXY` envs with Node.js native URL.

For our services to support username and password via url or `CDP_HTTP_PROXY` and `CDP_HTTPS_PROXY`, `HTTP_PROXY` and `HTTPS_PROXY` envs, there is work to be done first.

## Dotnet http client

Supports `HTTP_PROXY` and `HTTPS_PROXY` envs out of the box - https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclient.defaultproxy?view=net-8.0#remarks

In DotNet 6.0 you can Proxy via `HttpClientHandler` and `WebProxy`:

```
using System.Net;

var proxy = new WebProxy
{
    Address = new Uri($"http://172.104.241.29:8081"),
    BypassProxyOnLocal = false,
    UseDefaultCredentials = false,

    // Proxy credentials
    Credentials = new NetworkCredential(
        userName: proxyUserName,
        password: proxyPassword)
};

// Create a client handler that uses the proxy
var httpClientHandler = new HttpClientHandler
{
    Proxy = proxy,
};

// Disable SSL verification
httpClientHandler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;

// Finally, create the HTTP client object
var client = new HttpClient(handler: httpClientHandler, disposeHandler: true);

var result = await client.GetStringAsync("https://api.ipify.org/");
Console.WriteLine(result);
```

- https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclienthandler?view=net-6.0
- https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclienthandler.proxy?view=net-6.0#system-net-http-httpclienthandler-proxy
- https://learn.microsoft.com/en-us/dotnet/api/system.net.webproxy?view=net-6.0
- https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclienthandler.useproxy?view=net-6.0#system-net-http-httpclienthandler-useproxy

### Https Proxy

It appears there may be a way to use a https proxy in DotNet 6:

- https://www.scrapingbee.com/blog/csharp-httpclient-proxy/
- https://learn.microsoft.com/en-us/answers/questions/1181349/is-there-a-way-to-use-an-https-proxy-in-net-6

## Azure SDK DotNet

Supports `HTTP_PROXY` and `HTTPS_PROXY` envs out of the box

- https://learn.microsoft.com/en-us/dotnet/azure/sdk/azure-sdk-configure-proxy?tabs=cmd

# Node.js http clients and proxies

## Node URL functionality

Node.js URL object = https://nodejs.org/api/url.html

# Undici - https://github.com/nodejs/undici

## EnvHttpProxyAgent (undici)

`import { EnvHttpProxyAgent } from 'undici'`

Supports both `HTTP_PROXY` and `HTTPS_PROXY` (lower and upper case). And internally passes either into:

```
new ProxyAgent({ uri: HTTPS_PROXY })
```

https://github.com/nodejs/undici/blob/ad363d992d031cb61d0cf6ea8a7d8bfd0d5e250d/lib/dispatcher/env-http-proxy-agent.js#L42-L47
https://github.com/nodejs/undici/blob/ad363d992d031cb61d0cf6ea8a7d8bfd0d5e250d/docs/docs/api/EnvHttpProxyAgent.md?plain=1#L11

EnvHttpProxyAgent can be swapped out for our use of ProxyAgent from undici:

```
import { EnvHttpProxyAgent } from 'undici'
...
function provideProxy(proxyUrl = proxyUrlConfig) {
  if (proxyUrl) {
    const url = new URL(proxyUrl)
    const port = url.protocol.toLowerCase() === 'http' ? 80 : 443

    logger.debug(`Proxy set up using ${url.origin}:${port}`)

    return {
      url,
      port,
      proxyAgent: new EnvHttpProxyAgent(),
      httpAndHttpsProxyAgent: new HttpsProxyAgent(url)
    }
  }

  return null
}
```

Internally this uses ProxyAgent so also supports username and password in the url (`https://abc:xyz@example.com`).

## ProxyAgent (undici)

`import { ProxyAgent } from 'undici'`

Supports a Node.js URL object with username and password

```
new ProxyAgent({ uri: URL('https://abc:xyz@example.com') })
```

https://github.com/nodejs/undici/blob/ad363d992d031cb61d0cf6ea8a7d8bfd0d5e250d/lib/dispatcher/proxy-agent.js#L39
https://github.com/nodejs/undici/blob/ad363d992d031cb61d0cf6ea8a7d8bfd0d5e250d/lib/dispatcher/proxy-agent.js#L138
https://github.com/nodejs/undici/blob/ad363d992d031cb61d0cf6ea8a7d8bfd0d5e250d/lib/dispatcher/proxy-agent.js#L58

Does not support `HTTP_PROXY` and `HTTPS_PROXY` envs - see EnvHttpProxyAgent from undici for this support

## ProxyAgent - https://github.com/TooTallNate/proxy-agents

`import { ProxyAgent } from 'proxy-agent'`

Supports both `HTTP_PROXY` and `HTTPS_PROXY` (lower and upper case).
Does not support username and password in url - see HttpsProxyAgent from https-proxy-agent for this support

## HttpsProxyAgent - https://github.com/TooTallNate/proxy-agents

`import { HttpsProxyAgent } from 'https-proxy-agent'`

You can pass a string with username and password to`new HttpsProxyAgent('https://abc:xyz@example.com')`. This is passed
to a Node.js URL object - https://github.com/TooTallNate/proxy-agents/blob/5555794b6d9e4b0a36fac80a2d3acea876a8f7dc/packages/https-proxy-agent/src/index.ts#L54

Then it is used to set the [Proxy-Authorization header](https://github.com/TooTallNate/proxy-agents/blob/5555794b6d9e4b0a36fac80a2d3acea876a8f7dc/packages/https-proxy-agent/src/index.ts#L114-L121)

```
headers['Proxy-Authorization'] = `Basic ${Buffer.from(
  auth
).toString('base64')}`;
```

Does not support `HTTP_PROXY` and `HTTPS_PROXY` envs - see ProxyAgent from proxy-agent for this support

## Axios

Appears to support both http_proxy and https_proxy (need to confirm if HTTP_PROXY and HTTPS_PROXY is also respected) -
https://github.com/axios/axios/blob/0e4f9fa29077ebee4499facea6be1492b42e8a26/README.md?plain=1#L580-L590

> Note there are a number of issues open around Proxy so will need to confirm

According to this test it also supports http/s_proxy with username and password - https://github.com/axios/axios/blob/0e4f9fa29077ebee4499facea6be1492b42e8a26/test/unit/adapters/http.js#L1322-L1356

You can also set it via config:

```
...
proxy: {
  protocol: 'https',
  host: '127.0.0.1',
  // hostname: '127.0.0.1' // Takes precedence over 'host' if both are defined
  port: 9000,
  auth: {
    username: 'mikeymike',
    password: 'rapunz3l'
  }
},
...
```

https://github.com/axios/axios/blob/0e4f9fa29077ebee4499facea6be1492b42e8a26/README.md?plain=1#L591-L600
