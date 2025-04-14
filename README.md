# Declarative creation or WAFaaS assets

This scenario was validated in Github Codespace. Consider opening repo in Codespace and running the instructions there (or in local devcontainer).


### ⚠️ Important Notes

> **NOTE:** This is a PoC/concept and not production-ready code. It has not been tested for all edge cases and should be used with caution.

> **<span style="color:red;">SELF-SIGNED CERTIFICATES ARE NOT WORKING WITH WAFaaS.</span>** Documentation will be updated soon to reflect this limitation.

### Dependencies

```shell
# install Deno - https://docs.deno.com/runtime/getting_started/installation/
curl -fsSL https://deno.land/install.sh | sh

# install dotenvx - https://dotenvx.com/
curl -fsS https://dotenvx.sh | sudo sh

# open terminal again with new environment
exit

# check versions
deno --version
dotenvx --version
```

### WAF API key

Login to your CloudGuard WAF tenant and setup new admin keys for CloudGuard WAF:
https://portal.checkpoint.com/dashboard/settings/api-keys

![alt text](img/api-keys.png)

Create new `.env` file in the root of the project and add the following variables:

```env
# .env
# WAF API key
WAFKEY=xxx
# WAF API secret
WAFSECRET=yyy
# AUTH URL
WAFAUTHURL=https://cloudinfra-gw.portal.checkpoint.com/auth/external
```

You may validate your API key using the following command:

```shell
# validate WAF API key
dotenvx run -- env | grep ^WAF
```

### Test certificate

> **<span style="color:red;">SELF-SIGNED CERTIFICATES ARE NOT WORKING WITH WAFaaS.</span>** Documentation will be updated soon to reflect this limitation.

Optional: lets create self signed wildcard certificates for the demo.

```shell
# create new CA
openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -sha256 -days 1024 -out ca.crt -subj "/C=US/ST=CA/L=San Francisco/O=My Company/CN=ca.example.com"

# create a new server key and issue a certificate
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr -subj "/C=US/ST=CA/L=San Francisco/O=My Company/CN=*.example.com" -addext "subjectAltName = DNS:*.example.com"
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 500 --extfile <(echo "subjectAltName = DNS:*.example.com" )

# check what we have got
openssl x509 -in server.crt -text -noout | grep CN
openssl x509 -in server.crt -text -noout | grep DNS
# check CA cert too
openssl x509 -in ca.crt -text -noout | grep CN

# summary:
ls -la ca.*
ls -la server.*
```

### Create or review WAFaaS Profile

Visit WAFaaS asset in UI and note asset name and region.

https://portal.checkpoint.com/dashboard/appsec/cloudguardwaf#/waf-policy/profiles/ 

For example, the profile type is `CloudGuard WAF SaaS Profile` name is `saas-stockholm` and the region for Stockholm is `eu-north-1`.

| **Location** | **AWS Region Name** |
|--------------|---------------------|
| Stockholm    | eu-north-1          |
| Milan        | eu-south-1          |
| Ireland      |               |

![alt text](./img/wafaas-profile.png)


### Review assets.yaml definiton

`assets.yaml` file contains the WAFaaS asset definition. Here is typical template based on inputs we know:

```yaml
config:
  profile: "saas-stockholm"
  region: "eu-north-1"

assets:
  - name: "httpbin.example.com" # asset name
    domain: "httpbin.example.com" # front end url without https:// prefix
    host: "httpbin.org" # host header sent to upstream
    upstream: "https://httpbin.org"
    cert_pem: "server.crt" # certificate file location
    cert_key: "server.key" # key file location

  - name: "ifconfig.example.com" # asset name
    domain: "ifconfig.example.com" # front end url without https:// prefix
    host: "ifconfig.me" # host header sent to upstream
    upstream: "https://ifconfig.me"
    cert_pem: "server.crt" # certificate file location
    cert_key: "server.key" # key file location
```

### Execute asset provisioning

Script checks if asserts already exist and if not, creates them. It also uploads custom certificates as provided in files. 
It gives summary of service DNS recorts - CNAMEs to WAF service.

```shell
# check assets to create
cat assets.yaml

# execute deployment
dotenvx run -- deno run -A deploy-waf-with-own-cert.ts
```

### Expected results

Assets are created per YAML declaration in `assets.yaml` file.
Uploaded certificates are used for the assets and can be confirmed in the UI under the profile.

![alt text](img/domain-cert-uploaded.png)


### Validate services created

Assume that Profile instructions said for `west2.wafaas.klaud.online` to create CNAME record `west2.wafaas.klaud.online` pointing to `west2wafaasklaudonline.5c4121f6-2e3a-4672-b593-d94e06c65c73.3f10f27ca6ff.i2.checkpoint.com`.

```shell
# need dig cli tool:
sudo apt update; sudo apt install dnsutils -y
# resolve one of frontend IPs for WAF service
dig +short west2wafaasklaudonline.5c4121f6-2e3a-4672-b593-d94e06c65c73.3f10f27ca6ff.i2.checkpoint.com. A | tail -1
# save IP for later
WAFIP=$(dig +short west2wafaasklaudonline.5c4121f6-2e3a-4672-b593-d94e06c65c73.3f10f27ca6ff.i2.checkpoint.com. A | tail -1)

# tell curl to go via WAF service
curl https://west2.wafaas.klaud.online/ --resolve west2.wafaas.klaud.online:443:$WAFIP

# and WAF incident
curl 'https://west2.wafaas.klaud.online/?q=UNION+13=13--' --resolve west2.wafaas.klaud.online:443:$WAFIP
# check logs as we are in Detect/Learn mode

```

Note: script gives summary of WAF service CNAME similar to:

```shell
# execute deployment - all is done, so we check only state of Deployment
dotenvx run -- deno run -A deploy-waf-with-own-cert.ts

# expected DNS records:
# ./cfdns.ts create -n west2.wafaas.klaud.online. -c west2wafaasklaudonline.5c4121f6-2e3a-4672-b593-d94e06c65c73.3f10f27ca6ff.i2.checkpoint.com. -t CNAME
```

### Troubleshooting

- so far this is PoC/concept and if you want to run again for same list of assets, you might want to delete them first, publish&enforce and start again
