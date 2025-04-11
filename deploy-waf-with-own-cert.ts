
import { encode as encodeBase64 } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { parse as parseYaml } from "jsr:@std/yaml";

let wafSession = null

async function wafLogin(url: string, clientId: string, accessKey: string) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId, accessKey }),
    });

    if (response.ok) {
        console.log("Login successful");
        const data = await response.json();
        // console.log("data:", data);
        return data
    } else {
        console.error("Login failed");
    }

    return null
}

// POST https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql
// Authorization: Bearer {{token}}
// Content-Type: application/json

// {
//   "operationName": "ProfilesName",
//   "variables": {},
//   "query": "query ProfilesName($matchSearch: String, $filters: ProfileFilter, $paging: Paging, $sortBy: SortBy) {\n  getProfiles(\n    matchSearch: $matchSearch\n    filters: $filters\n    paging: $paging\n    sortBy: $sortBy\n  ) {\n    id\n    name\n    __typename\n  }\n}\n"
// }
async function wafProfiles() {
    const url = "https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql";
    const token = wafSession?.data?.token;
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    const body = {
        "operationName": "ProfilesName",
        "variables": {},
        "query": "query ProfilesName($matchSearch: String, $filters: ProfileFilter, $paging: Paging, $sortBy: SortBy) {\n  getProfiles(\n    matchSearch: $matchSearch\n    filters: $filters\n    paging: $paging\n    sortBy: $sortBy\n  ) {\n    id\n    name\n    __typename\n  }\n}\n"
    };
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
    if (response.ok) {
        console.log("Profiles fetched successfully");
        const data = await response.json();
        console.log("data:", data);
        return data?.data?.getProfiles.map((profile: any) => ({
            id: profile.id,
            name: profile.name,
        })) || [];
    } else {
        console.error("Failed to fetch profiles");
        const errorData = await response.json();
        console.error("Error data:", errorData);
    }
    return []
}

async function getProfileId(profileName: string) {
    const profiles = await wafProfiles();
    const profile = profiles.find((p: any) => p.name === profileName);
    if (profile) {
        return profile.id;
    }
    return null;
}

// POST https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql
// Authorization: Bearer {{token}}
// Content-Type: application/json

// {
//   "operationName": "Profile",
//   "variables": {
//     "id": "cec6d6ae-8901-7b1b-485e-ae9cb9b373d8"
//   },
//   "query": "query Profile($id: ID!) {\n  getProfile(id: $id) {\n    id\n    name\n    profileType\n    status\n    additionalSettings {\n      id\n      key\n      value\n      __typename\n    }\n    tags {\n      id\n      tag\n      __typename\n    }\n    latestEnforcedPolicy {\n      timestamp\n      version\n      __typename\n    }\n    objectStatus\n    numberOfAgents\n    numberOfOutdatedAgents\n    usedBy {\n      id\n      name\n      subType\n      __typename\n    }\n    ... on KubernetesProfile {\n      profileSubType\n      maxNumberOfAgents\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      onlyDefinedApplications\n      failOpenInspection\n      managerInfo {\n        managerId\n        managerName\n        __typename\n      }\n      profileManagedBy\n      __typename\n    }\n    ... on VirtualNSaaSProfile {\n      cloudVendor\n      cloudAccounts {\n        id\n        accountId\n        accountRegions {\n          id\n          regionName\n          vpcEndpointService\n          __typename\n        }\n        __typename\n      }\n      managerInfo {\n        managerId\n        managerName\n        __typename\n      }\n      ARNOutboundCertificate\n      __typename\n    }\n    ... on AppSecSaaSProfile {\n      region\n      maxNumberOfAgents\n      failOpenInspection\n      certificateDomains {\n        id\n        domain\n        certificateParameter {\n          id\n          ... on CertificateParameter {\n            isCPManaged\n            certificateFile {\n              id\n              name\n              __typename\n            }\n            keyName\n            certificateFileName\n            certificateExpirationDate\n            certificateARN\n            certificateARNForCloudfront\n            __typename\n          }\n          __typename\n        }\n        cnameName\n        cnameValue\n        certificateValidationStatus\n        validationInfo\n        __typename\n      }\n      usedByType {\n        assets {\n          id\n          name\n          ... on WebApplicationAsset {\n            URLs {\n              id\n              URL\n              __typename\n            }\n            upstreamURL\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on EmbeddedProfile {\n      profileSubType\n      maxNumberOfAgents\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      failOpenInspection\n      onlyDefinedApplications\n      profileManagedBy\n      managedByNginx\n      __typename\n    }\n    ... on QuantumProfile {\n      cloudId\n      maxNumberOfAgents\n      numberOfAgents\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on DockerProfile {\n      profileSubType\n      maxNumberOfAgents\n      vendor\n      isSelfManaged\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      onlyDefinedApplications\n      failOpenInspection\n      managerInfo {\n        managerId\n        managerName\n        __typename\n      }\n      profileManagedBy\n      managedByNginx\n      __typename\n    }\n    ... on CloudNativeProfile {\n      maxNumberOfAgents\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      onlyDefinedApplications\n      __typename\n    }\n    ... on CloudGuardAppSecGatewayProfile {\n      profileSubType\n      certificateType\n      maxNumberOfAgents\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      usedByType {\n        assets {\n          id\n          name\n          assetType\n          class\n          category\n          family\n          group\n          order\n          kind\n          tags {\n            id\n            tag\n            __typename\n          }\n          ... on WebApplicationAsset {\n            URLs {\n              id\n              URL\n              __typename\n            }\n            upstreamURL\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      reverseProxyUpstreamTimeout\n      reverseProxyAdditionalSettings {\n        key\n        value\n        __typename\n      }\n      failOpenInspection\n      __typename\n    }\n    ... on IotEnforcementProfile {\n      policyPackagesWithIotLayer {\n        id\n        name\n        type\n        subType\n        __typename\n      }\n      enforceIotLayerOnGateways {\n        id\n        name\n        type\n        subType\n        __typename\n      }\n      enforceIotLayerOnAllGateways\n      installPolicyOnEnforce\n      __typename\n    }\n    ... on IotConfigurationVirtualProfile {\n      iotState\n      shouldEnforceBetaRules\n      configurationsSettings {\n        id\n        key\n        value\n        __typename\n      }\n      __typename\n    }\n    ... on IotConfigurationProfile {\n      iotState\n      shouldEnforceBetaRules\n      configurationsSettings {\n        id\n        key\n        value\n        __typename\n      }\n      __typename\n    }\n    ... on IotBuiltinDiscoveryProfile {\n      numberOfLogicalAgents\n      additionalSettings {\n        id\n        key\n        value\n        __typename\n      }\n      integrationType\n      arguments\n      dnsProbing\n      mdnsProbing\n      upnpProbing\n      snmpProbing\n      sshProbing\n      httpProbing\n      telnetProbing\n      ftpProbing\n      matchQuery\n      installDiscoveryOnMgmt\n      installDiscoveryOnAllGateWays\n      installDiscoveryOn {\n        id\n        name\n        type\n        subType\n        __typename\n      }\n      enforceAssetsOnPolicyPackages {\n        id\n        name\n        type\n        subType\n        __typename\n      }\n      sendAssetsToGateways\n      __typename\n    }\n    ... on IotRiskProfile {\n      numberOfLogicalAgents\n      matchQuery\n      overrideSettings\n      configurationSettings\n      installDiscoveryOnMgmt\n      installDiscoveryOnAllGateWays\n      installDiscoveryOn {\n        id\n        name\n        type\n        subType\n        __typename\n      }\n      runActiveNmapProbing\n      __typename\n    }\n    ... on SdWanProfile {\n      matchQuery\n      SdWanGateways {\n        id\n        name\n        objectStatus\n        __typename\n      }\n      numberOfAgents\n      __typename\n    }\n    ... on IoTEmbeddedProfile {\n      maxNumberOfAgents\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      failOpenInspection\n      onlyDefinedApplications\n      profileManagedBy\n      __typename\n    }\n    __typename\n  }\n}\n"
// }

async function getProfile(profileId: string) {
    const url = "https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql";
    const token = wafSession?.data?.token;
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    const body = {
        "operationName": "Profile",
        "variables": {
            "id": profileId
        },
        "query": "query Profile($id: ID!) {\n  getProfile(id: $id) {\n    id\n    name\n    profileType\n    status\n    additionalSettings {\n      id\n      key\n      value\n      __typename\n    }\n    tags {\n      id\n      tag\n      __typename\n    }\n    latestEnforcedPolicy {\n      timestamp\n      version\n      __typename\n    }\n    objectStatus\n    numberOfAgents\n    numberOfOutdatedAgents\n    usedBy {\n      id\n      name\n      subType\n      __typename\n    }\n    ... on KubernetesProfile {\n      profileSubType\n      maxNumberOfAgents\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      onlyDefinedApplications\n      failOpenInspection\n      managerInfo {\n        managerId\n        managerName\n        __typename\n      }\n      profileManagedBy\n      __typename\n    }\n    ... on VirtualNSaaSProfile {\n      cloudVendor\n      cloudAccounts {\n        id\n        accountId\n        accountRegions {\n          id\n          regionName\n          vpcEndpointService\n          __typename\n        }\n        __typename\n      }\n      managerInfo {\n        managerId\n        managerName\n        __typename\n      }\n      ARNOutboundCertificate\n      __typename\n    }\n    ... on AppSecSaaSProfile {\n      region\n      maxNumberOfAgents\n      failOpenInspection\n      certificateDomains {\n        id\n        domain\n        certificateParameter {\n          id\n          ... on CertificateParameter {\n            isCPManaged\n            certificateFile {\n              id\n              name\n              __typename\n            }\n            keyName\n            certificateFileName\n            certificateExpirationDate\n            certificateARN\n            certificateARNForCloudfront\n            __typename\n          }\n          __typename\n        }\n        cnameName\n        cnameValue\n        certificateValidationStatus\n        validationInfo\n        __typename\n      }\n      usedByType {\n        assets {\n          id\n          name\n          ... on WebApplicationAsset {\n            URLs {\n              id\n              URL\n              __typename\n            }\n            upstreamURL\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on EmbeddedProfile {\n      profileSubType\n      maxNumberOfAgents\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      failOpenInspection\n      onlyDefinedApplications\n      profileManagedBy\n      managedByNginx\n      __typename\n    }\n    ... on QuantumProfile {\n      cloudId\n      maxNumberOfAgents\n      numberOfAgents\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on DockerProfile {\n      profileSubType\n      maxNumberOfAgents\n      vendor\n      isSelfManaged\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      onlyDefinedApplications\n      failOpenInspection\n      managerInfo {\n        managerId\n        managerName\n        __typename\n      }\n      profileManagedBy\n      managedByNginx\n      __typename\n    }\n    ... on CloudNativeProfile {\n      maxNumberOfAgents\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      onlyDefinedApplications\n      __typename\n    }\n    ... on CloudGuardAppSecGatewayProfile {\n      profileSubType\n      certificateType\n      maxNumberOfAgents\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      usedByType {\n        assets {\n          id\n          name\n          assetType\n          class\n          category\n          family\n          group\n          order\n          kind\n          tags {\n            id\n            tag\n            __typename\n          }\n          ... on WebApplicationAsset {\n            URLs {\n              id\n              URL\n              __typename\n            }\n            upstreamURL\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      reverseProxyUpstreamTimeout\n      reverseProxyAdditionalSettings {\n        key\n        value\n        __typename\n      }\n      failOpenInspection\n      __typename\n    }\n    ... on IotEnforcementProfile {\n      policyPackagesWithIotLayer {\n        id\n        name\n        type\n        subType\n        __typename\n      }\n      enforceIotLayerOnGateways {\n        id\n        name\n        type\n        subType\n        __typename\n      }\n      enforceIotLayerOnAllGateways\n      installPolicyOnEnforce\n      __typename\n    }\n    ... on IotConfigurationVirtualProfile {\n      iotState\n      shouldEnforceBetaRules\n      configurationsSettings {\n        id\n        key\n        value\n        __typename\n      }\n      __typename\n    }\n    ... on IotConfigurationProfile {\n      iotState\n      shouldEnforceBetaRules\n      configurationsSettings {\n        id\n        key\n        value\n        __typename\n      }\n      __typename\n    }\n    ... on IotBuiltinDiscoveryProfile {\n      numberOfLogicalAgents\n      additionalSettings {\n        id\n        key\n        value\n        __typename\n      }\n      integrationType\n      arguments\n      dnsProbing\n      mdnsProbing\n      upnpProbing\n      snmpProbing\n      sshProbing\n      httpProbing\n      telnetProbing\n      ftpProbing\n      matchQuery\n      installDiscoveryOnMgmt\n      installDiscoveryOnAllGateWays\n      installDiscoveryOn {\n        id\n        name\n        type\n        subType\n        __typename\n      }\n      enforceAssetsOnPolicyPackages {\n        id\n        name\n        type\n        subType\n        __typename\n      }\n      sendAssetsToGateways\n      __typename\n    }\n    ... on IotRiskProfile {\n      numberOfLogicalAgents\n      matchQuery\n      overrideSettings\n      configurationSettings\n      installDiscoveryOnMgmt\n      installDiscoveryOnAllGateWays\n      installDiscoveryOn {\n        id\n        name\n        type\n        subType\n        __typename\n      }\n      runActiveNmapProbing\n      __typename\n    }\n    ... on SdWanProfile {\n      matchQuery\n      SdWanGateways {\n        id\n        name\n        objectStatus\n        __typename\n      }\n      numberOfAgents\n      __typename\n    }\n    ... on IoTEmbeddedProfile {\n      maxNumberOfAgents\n      authentication {\n        authenticationType\n        tokens {\n          token\n          id\n          expirationTime\n          __typename\n        }\n        __typename\n      }\n      upgradeMode\n      upgradeTime {\n        duration\n        time\n        scheduleType\n        ... on ScheduleDaysInMonth {\n          days\n          __typename\n        }\n        ... on ScheduleDaysInWeek {\n          weekDays\n          __typename\n        }\n        __typename\n      }\n      failOpenInspection\n      onlyDefinedApplications\n      profileManagedBy\n      __typename\n    }\n    __typename\n  }\n}\n",
    };
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
    if (response.ok) {
        console.log("Profile fetched successfully");
        const data = await response.json();
        console.log("data:", data);
        return data?.data?.getProfile;
    } else {
        console.error("Failed to fetch profile");
        const errorData = await response.json();
        console.error("Error data:", errorData);
    }
    return null
}

// POST https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql
// Authorization: Bearer {{token}}
// Content-Type: application/json

// {
//   "operationName": "Deployment",
//   "variables": {
//     "profileId": "cec6d6ae-8901-7b1b-485e-ae9cb9b373d8",
//     "region": "eu-west-1"
//   },
//   "query": "query Deployment($profileId: String, $region: String) {\n  getDeployment(profileId: $profileId, region: $region) {\n    domains {\n      domain\n      recordType\n      recordValue\n      deploymentStatus\n      deploymentTasks {\n        taskName\n        taskStatus\n        __typename\n      }\n      failureReason\n      protectionTestResult\n      __typename\n    }\n    natIPs\n    __typename\n  }\n}\n"
// }
async function getDeploymentStatus(profileId: string, region: string) {
    const url = "https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql";
    const token = wafSession?.data?.token;
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    const body = {
        "operationName": "Deployment",
        "variables": {
            "profileId": profileId,
            "region": region,
        },
        "query": "query Deployment($profileId: String, $region: String) {\n  getDeployment(profileId: $profileId, region: $region) {\n    domains {\n      domain\n      recordType\n      recordValue\n      deploymentStatus\n      deploymentTasks {\n        taskName\n        taskStatus\n        __typename\n      }\n      failureReason\n      protectionTestResult\n      __typename\n    }\n    natIPs\n    __typename\n  }\n}\n"
    };
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
    if (response.ok) {
        console.log("Deployment fetched successfully");
        const data = await response.json();
        // console.log("data:", data);
        return data?.data?.getDeployment;
    } else {
        console.error("Failed to fetch deployment");
        const errorData = await response.json();
        console.error("Error data:", errorData);
    }
    return null
}

function validationCnames(profileData) {
    console.log("profileData:", profileData);
}

function deployments(deploymentData) {
    const domains = deploymentData?.domains;
    // console.log("domains:", domains);
    return domains?.map((domain: any) => {
        return {
            domain: domain.domain,
            recordType: domain.recordType,
            recordValue: domain.recordValue,
            deploymentStatus: domain.deploymentStatus,

            failureReason: domain.failureReason,
            protectionTestResult: domain.protectionTestResult,
        }
    }) || [];
}

// POST https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql
// Authorization: Bearer {{token}}
// Content-Type: application/json

// {
//   "operationName": "AssetsName",
//   "variables": {
//     "matchSearch": [
//       ""
//     ],
//     "globalObject": false,
//     "paging": {
//       "offset": 0,
//       "limit": 50
//     },
//     "filters": {}
//   },
//   "query": "query AssetsName($matchSearch: [String], $sortBy: SortBy, $globalObject: Boolean, $filters: AssetsFilter, $paging: Paging) {\n  getAssets(\n    matchSearch: $matchSearch\n    sortBy: $sortBy\n    globalObject: $globalObject\n    filters: $filters\n    paging: $paging\n  ) {\n    assets {\n      id\n      name\n      assetType\n      __typename\n    }\n    __typename\n  }\n}\n"
// }
async function getAssets(matchSearch: string | undefined) {
    const url = "https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql";
    const token = wafSession?.data?.token;
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    const body = {
        "operationName": "AssetsName",
        "variables": {
            "matchSearch": [
                matchSearch ? matchSearch : ""
            ],
            "globalObject": false,
            "paging": {
                "offset": 0,
                "limit": 50
            },
            "filters": {}
        },
        "query": "query AssetsName($matchSearch: [String], $sortBy: SortBy, $globalObject: Boolean, $filters: AssetsFilter, $paging: Paging) {\n  getAssets(\n    matchSearch: $matchSearch\n    sortBy: $sortBy\n    globalObject: $globalObject\n    filters: $filters\n    paging: $paging\n  ) {\n    assets {\n      id\n      name\n      assetType\n      __typename\n    }\n    __typename\n  }\n}\n"
    };
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
    if (response.ok) {
        console.log("Assets fetched successfully");
        const data = await response.json();
        // console.log("data:", data);
        return data?.data?.getAssets?.assets?.map((asset: any) => ({
            id: asset.id,
            name: asset.name,
        })) || [];
    } else {
        console.error("Failed to fetch assets");
        const errorData = await response.json();
        console.error("Error data:", errorData);
    }
    return null
}

// POST https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql
// Authorization: Bearer {{token}}
// Content-Type: application/json

// {
//   "operationName": "newAssetByWizard",
//   "variables": {
//     "assetType": "WebApplication",
//     "assetInput": {
//       "name": "devv12.klaud.online",
//       "URLs": [
//         "https://devv12.klaud.online"
//       ],
//       "tags": [],
//       "stage": "Staging",
//       "sourceIdentifiers": [
//         {
//           "sourceIdentifier": "XForwardedFor",
//           "values": []
//         }
//       ],
//       "deployCertificateManually": true,
//       "state": "Active",
//       "upstreamURL": "https://dev.to"
//     },
//     "profileInput": {
//       "name": "saas-feb15",
//       "id": "cec6d6ae-8901-7b1b-485e-ae9cb9b373d8",
//       "profileType": "AppSecSaaS",
//       "region": "eu-west-1"
//     },
//     "zoneInput": {},
//     "parameterInput": {
//       "numOfSources": 3,
//       "sourcesIdentifiers": []
//     },
//     "practiceInput": [
//       {
//         "practiceType": "WebApplication",
//         "modes": [
//           {
//             "mode": "Learn",
//             "subPractice": ""
//           },
//           {
//             "mode": "AccordingToPractice",
//             "subPractice": "WebAttacks"
//           },
//           {
//             "mode": "AccordingToPractice",
//             "subPractice": "IPS"
//           }
//         ]
//       },
//       {
//         "practiceType": "APIProtection",
//         "modes": [
//           {
//             "mode": "Disabled",
//             "subPractice": ""
//           },
//           {
//             "mode": "Disabled",
//             "subPractice": "APIDiscovery"
//           },
//           {
//             "mode": "AccordingToPractice",
//             "subPractice": "SchemaValidation"
//           }
//         ]
//       }
//     ],
//     "reportTriggerInput": {}
//   },
//   "query": "mutation newAssetByWizard($assetType: AssetType!, $assetInput: wizardAssetInput!, $profileInput: wizardProfileInput!, $zoneInput: wizardZoneInput, $parameterInput: wizardParameterInput, $practiceInput: [wizardPracticeInput], $reportTriggerInput: wizardReportTriggerInput) {\n  newAssetByWizard(\n    assetType: $assetType\n    assetInput: $assetInput\n    profileInput: $profileInput\n    zoneInput: $zoneInput\n    parameterInput: $parameterInput\n    practiceInput: $practiceInput\n    reportTriggerInput: $reportTriggerInput\n  ) {\n    id\n    name\n    assetType\n    profiles {\n      id\n      name\n      __typename\n    }\n    practices {\n      practice {\n        id\n        category\n        __typename\n      }\n      triggers {\n        id\n        name\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
// }

// domain - e.g. devv12.klaud.online
// upstream e.g. https://dev.to
// region - e.g. eu-west-1
// profileId - e.g. cec6d6ae-8901-7b1b-485e-ae9cb9b373d8
// profileName - e.g. saas-feb15

async function newAsset(assetData: { name: string, domain: string, upstream: string, region: string, profileId: string, profileName: string }) {
    const url = "https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql";
    const token = wafSession?.data?.token;
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    const body = {
        "operationName": "newAssetByWizard",
        "variables": {
            "assetType": "WebApplication",
            "assetInput": {
                "name": assetData.name,
                "URLs": [
                    `https://${assetData.domain}`
                ],
                "tags": [],
                "stage": "Staging",
                "sourceIdentifiers": [
                    {
                        "sourceIdentifier": "XForwardedFor",
                        "values": []
                    }
                ],
                "deployCertificateManually": true,
                "state": "Active",
                "upstreamURL": assetData.upstream
            },
            "profileInput": {
                "name": assetData.profileName,
                "id": assetData.profileId,
                "profileType": "AppSecSaaS",
                isCertificateUploadRequired: true,
                "region": assetData.region
            },
            "zoneInput": {},
            "parameterInput": {
                "numOfSources": 3,
                "sourcesIdentifiers": []
              },
              "practiceInput": [
                {
                  "practiceType": "WebApplication",
                  "modes": [
                    {
                      "mode": "Learn",
                      "subPractice": ""
                    },
                    {
                      "mode": "AccordingToPractice",
                      "subPractice": "WebAttacks"
                    },
                    {
                      "mode": "AccordingToPractice",
                      "subPractice": "IPS"
                    }
                  ]
                },
                {
                  "practiceType": "APIProtection",
                  "modes": [
                    {
                      "mode": "Disabled",
                      "subPractice": ""
                    },
                    {
                      "mode": "Disabled",
                      "subPractice": "APIDiscovery"
                    },
                    {
                      "mode": "AccordingToPractice",
                      "subPractice": "SchemaValidation"
                    }
                  ]
                }
              ],
              "reportTriggerInput": {}
            // Add other inputs as needed
        },
        "query": "mutation newAssetByWizard($assetType: AssetType!, $assetInput: wizardAssetInput!, $profileInput: wizardProfileInput!, $zoneInput: wizardZoneInput, $parameterInput: wizardParameterInput, $practiceInput: [wizardPracticeInput], $reportTriggerInput: wizardReportTriggerInput) {\n  newAssetByWizard(\n    assetType: $assetType\n    assetInput: $assetInput\n    profileInput: $profileInput\n    zoneInput: $zoneInput\n    parameterInput: $parameterInput\n    practiceInput: $practiceInput\n    reportTriggerInput: $reportTriggerInput\n  ) {\n    id\n    name\n    assetType\n    profiles {\n      id\n      name\n      __typename\n    }\n    practices {\n      practice {\n        id\n        category\n        __typename\n      }\n      triggers {\n        id\n        name\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
    };
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
    if (response.ok) {
        console.log("Asset created successfully");
        const data = await response.json();
        // console.log("data:", data);
        return data?.data?.newAssetByWizard;
    }
    else {
        console.error("Failed to create asset");
        const errorData = await response.json();
        console.error("Error data:", errorData);
    }
    return null
}

// POST https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql
// Authorization: Bearer {{token}}
// Content-Type: application/json

// {
//   "operationName": "publishChanges",
//   "variables": {
//     "profileTypes": [
//       "Docker",
//       "CloudGuardAppSecGateway",
//       "Embedded",
//       "Kubernetes",
//       "AppSecSaaS"
//     ]
//   },
//   "query": "mutation publishChanges($profileTypes: [ProfileType!], $skipNginxValidation: Boolean) {\n  publishChanges(\n    profileTypes: $profileTypes\n    skipNginxValidation: $skipNginxValidation\n  ) {\n    isValid\n    errors {\n      message\n      __typename\n    }\n    warnings {\n      message\n      __typename\n    }\n    isNginxErrors\n    __typename\n  }\n}\n"
// }

async function publishChanges() {
    const url = "https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql";
    const token = wafSession?.data?.token;
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    const body = {
        "operationName": "publishChanges",
        "variables": {
            "profileTypes": [
                "Docker",
                "CloudGuardAppSecGateway",
                "Embedded",
                "Kubernetes",
                "AppSecSaaS"
            ]
        },
        "query": "mutation publishChanges($profileTypes: [ProfileType!], $skipNginxValidation: Boolean) {\n  publishChanges(\n    profileTypes: $profileTypes\n    skipNginxValidation: $skipNginxValidation\n  ) {\n    isValid\n    errors {\n      message\n      __typename\n    }\n    warnings {\n      message\n      __typename\n    }\n    isNginxErrors\n    __typename\n  }\n}\n"

    }

    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
    if (response.ok) {
        console.log("Changes published successfully");
        const data = await response.json();
        // console.log("data:", data);
        return data?.data?.publishChanges;
    } else {
        console.error("Failed to publish changes");
        const errorData = await response.json();
        console.error("Error data:", errorData);
    }
    return null
}

// POST https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql
// Authorization: Bearer {{token}}
// Content-Type: application/json

// {
//   "operationName": "enforcePolicy",
//   "variables": {
//     "profileTypes": [
//       "Docker",
//       "CloudGuardAppSecGateway",
//       "Embedded",
//       "Kubernetes",
//       "AppSecSaaS"
//     ]
//   },
//   "query": "mutation enforcePolicy($profilesIds: [ID!], $profileTypes: [ProfileType!]) {\n  enforcePolicy(profilesIds: $profilesIds, profileTypes: $profileTypes) {\n    id\n    tenantId\n    type\n    status\n    startTime\n    endTime\n    message\n    errorCode\n    referenceId\n    __typename\n  }\n}\n"
// }
async function enforcePolicy() {
    const url = "https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql";
    const token = wafSession?.data?.token;
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    const body = {
        "operationName": "enforcePolicy",
        "variables": {
            "profileTypes": [
                "Docker",
                "CloudGuardAppSecGateway",
                "Embedded",
                "Kubernetes",
                "AppSecSaaS"
            ]
        },
        "query": "mutation enforcePolicy($profilesIds: [ID!], $profileTypes: [ProfileType!]) {\n  enforcePolicy(profilesIds: $profilesIds, profileTypes: $profileTypes) {\n    id\n    tenantId\n    type\n    status\n    startTime\n    endTime\n    message\n    errorCode\n    referenceId\n    __typename\n  }\n}\n"
    }
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
    if (response.ok) {
        console.log("Policy enforced successfully");
        const data = await response.json();
        // console.log("data:", data);
        return data?.data?.enforcePolicy;
    } else {
        console.error("Failed to enforce policy");
        const errorData = await response.json();
        console.error("Error data:", errorData);
    }
    return null
}

// POST https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql
// Authorization: Bearer {{token}}
// Content-Type: application/json

// {
//   "operationName": "updateWebApplicationProxySetting",
//   "variables": {
//     "id": "{{assetId}}",
//     "addProxySettingItems": [
//       {
//         "key": "isSetHeader",
//         "value": "true"
//       },
//       {
//         "key": "setHeader",
//         "value": "Host:dev.to"
//       }
//     ],
//     "updateProxySettingItems": [],
//     "removeProxySettingItems": []
//   },
//   "query": "mutation updateWebApplicationProxySetting($id: ID!, $addProxySettingItems: [WebApplicationProxySettingItemsInput], $removeProxySettingItems: [ID], $updateProxySettingItems: [WebApplicationProxySettingItemsUpdateInput]) {\n  updateWebApplicationProxySetting(\n    id: $id\n    addProxySettingItems: $addProxySettingItems\n    removeProxySettingItems: $removeProxySettingItems\n    updateProxySettingItems: $updateProxySettingItems\n  )\n}\n"
// }
async function setHostHeader(assetId: string, hostHeader: string) {
    const url = "https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql";
    const token = wafSession?.data?.token;
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    const body = {
        "operationName": "updateWebApplicationProxySetting",
        "variables": {
            "id": assetId,
            "addProxySettingItems": [
                {
                    "key": "isSetHeader",
                    "value": "true"
                },
                {
                    "key": "setHeader",
                    "value": `Host:${hostHeader}`
                }
            ],
            "updateProxySettingItems": [],
            "removeProxySettingItems": []
        },
        "query": "mutation updateWebApplicationProxySetting($id: ID!, $addProxySettingItems: [WebApplicationProxySettingItemsInput], $removeProxySettingItems: [ID], $updateProxySettingItems: [WebApplicationProxySettingItemsUpdateInput]) {\n  updateWebApplicationProxySetting(\n    id: $id\n    addProxySettingItems: $addProxySettingItems\n    removeProxySettingItems: $removeProxySettingItems\n    updateProxySettingItems: $updateProxySettingItems\n  )\n}\n"
    }
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
    if (response.ok) {
        console.log("Host header set successfully");
        const data = await response.json();
        // console.log("data:", data);
        return data?.data?.updateWebApplicationProxySetting;
    }
    else {
        console.error("Failed to set host header");
        const errorData = await response.json();
        console.error("Error data:", errorData);
    }
    return null
}

// POST https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql
// Authorization: Bearer {{token}}
// Content-Type: application/json

// {
//   "variables": {
//     "id": "4ecb1077-efc4-51fb-8707-8bcdbed2c9e3"
//   },
//   "query": "query getTask($id: ID!) {\n  getTask(id: $id) {\n    id\n    status\n    startTime\n  endTime\n   message\n    errorCode\n    referenceId\n    tenantId\n  }\n}\n"
// }
async function getTask(taskid: string) {
    const url = "https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql";
    const token = wafSession?.data?.token;
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    const body = {
        "variables": {
            "id": taskid
        },
        "query": "query getTask($id: ID!) {\n  getTask(id: $id) {\n    id\n    status\n    startTime\n  endTime\n   message\n    errorCode\n    referenceId\n    tenantId\n  }\n}\n"
    }
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
    if (response.ok) {
        console.log("Task fetched successfully");
        const data = await response.json();
        // console.log("data:", data);
        return data?.data?.getTask;
    }
    else {
        console.error("Failed to fetch task");
        const errorData = await response.json();
        console.error("Error data:", errorData);
    }
    return null
}

// POST https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql
// Authorization: Bearer {{token}}
// Content-Type: application/json

// {
//   "operationName": "PublicKey",
//   "variables": {
//     "sensitiveFieldName": "nexusCertificate",
//     "profileId": "cec6d6ae-8901-7b1b-485e-ae9cb9b373d8",
//     "region": "eu-west-1"
//   },
//   "query": "query PublicKey($sensitiveFieldName: String!, $profileId: ID!, $region: String!) {\n  getPublicKey(\n    sensitiveFieldName: $sensitiveFieldName\n    profileId: $profileId\n    region: $region\n  )\n}\n"
// }
async function getEncryptionPublicKey(profileId: string, region: string) {
    const url = "https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql";
    const token = wafSession?.data?.token;
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    const body = {
        "operationName": "PublicKey",
        "variables": {
            "sensitiveFieldName": "nexusCertificate",
            "profileId": profileId,
            "region": region
        },
        "query": "query PublicKey($sensitiveFieldName: String!, $profileId: ID!, $region: String!) {\n  getPublicKey(\n    sensitiveFieldName: $sensitiveFieldName\n    profileId: $profileId\n    region: $region\n  )\n}\n"
    }
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
    if (response.ok) {
        console.log("Public key fetched successfully");
        const data = await response.json();
        // console.log("data:", data);
        return data?.data?.getPublicKey;
    }
    else {
        console.error("Failed to fetch public key");
        const errorData = await response.json();
        console.error("Error data:", errorData);
    }
    return null
}

const encryptPrivateKey = async (privateKey: string, publicKeyPem: string) => {
    try {
        // Generate random bytes for AES key and IV
        const aesKey = crypto.getRandomValues(new Uint8Array(32));
        const iv = crypto.getRandomValues(new Uint8Array(16));

        // Create a buffer from the private key
        const privateKeyBuffer = new TextEncoder().encode(privateKey);

        // Import the AES key
        const aesCryptoKey = await crypto.subtle.importKey(
            "raw",
            aesKey,
            "AES-CBC",
            false,
            ["encrypt"]
        );

        // Encrypt the private key using AES-CBC
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: "AES-CBC",
                iv: iv,
            },
            aesCryptoKey,
            privateKeyBuffer
        );

        const encryptedDataBase64 = encodeBase64(new Uint8Array(encryptedData));
        const ivBase64 = encodeBase64(iv);


        // Remove the PEM header and footer
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = publicKeyPem
            .replace(pemHeader, "")
            .replace(pemFooter, "")
            .replace(/[\r\n]+/g, ""); // Remove newlines

        // Decode the base64 content
        const binaryDer = Uint8Array.from(atob(pemContents), c =>
            c.charCodeAt(0)
        );

        // Import the public key
        const publicKey = await crypto.subtle.importKey(
            "spki",
            binaryDer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            false,
            ["encrypt"]
        );

        // Encrypt the AES key using the provided public key (RSA-OAEP)
        const encryptedAesKey = await crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            publicKey,
            aesKey
        );

        const encryptedKeyBase64 = encodeBase64(new Uint8Array(encryptedAesKey));

        return {
            encryptedData: ivBase64 + encryptedDataBase64,
            encryptedKey: encryptedKeyBase64,
        };
    } catch (error) {
        console.error(error);
        return {
            encryptedData: "",
            encryptedKey: "",
        };
    }
};


// POST https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql
// Authorization: Bearer {{token}}
// Content-Type: application/json

// {
//   "operationName": "addSensitiveField",
//   "variables": {
//     "sensitiveFieldName": "nexusCertificate",
//     "encryptedFieldValue": "LT+gcFbmG2aRyeMxw9YAfw==S8hXSSAJg5HvIs6ArvUscT1vgL4OUyRSgyQKy4KwgBSxi/qVADDRt3UmOygyAhOounCUMaLqhlY6Bnyu3/B4mUXZl05GYn6IzBREUi4fIC7rM/7NSbeibX5V0xNZ1wNgaWpMQnEoOQQrxFLWF33Nr+qltiTirqIgElNv+T40zMv55W4C4qipW91mI9NdoTVblkDlh2NuaHN78gF58ezMw9Y9u0sqgT4n4ps6Uc+s1VWXaI4goJ5LzDl2R0yxRps4dEKjWWZ189XUf0qf6ydHfs6P5p+affiQeujJ91Bszqk/Y+2DnhJnH2LHFEEox28+2RoWxZ7dZn0dgCtajastBw==",
//     "encryptedKey": "PYJ5b7/mA/d1of92ue3pvxlLuffnGRyUXWEvsFvTjsBsxeUynVRwxq+1LTgf67CcptkIWBzVd1/bOYw9EmVjdEsyRBBLCO4QPZ9hkDvZ6OeSoRdopmVlLv8DCLJKXy3eHwL3X/dwGur7oJqM43YQEkWxiw+3xyxp0B1gMzNS0Q7YPP4npczCHYMmDV4qBxgPaY7FWqDOZLE6OnAMV5NCpJugELdx5fSZQvAOl4EoHdpTQq4Gx3lORpfMMeQOkTmlqxUMUeARBaBmgTTGilMYytvJy3Zbp4qqiVVUlLOOtYj+Q7ePsCsSxgqHSxvj/R1JYh0/YFFWOuqsIGg7tnViWA==",
//     "certificate": "-----BEGIN CERTIFICATE-----\nMIIDtjCCAzygAwIBAgISBRK7nnRmgfbClILpWcgQe01GMAoGCCqGSM49BAMDMDIx\nCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQswCQYDVQQDEwJF\nNjAeFw0yNTA0MTAxMzIwMjFaFw0yNTA3MDkxMzIwMjBaMB4xHDAaBgNVBAMTE2Rl\ndnYxOS5rbGF1ZC5vbmxpbmUwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQzocCd\nZwT20v6vUeKA5kCoPuecxeNAI9jul3c5bikYXDMNeGwk6F2hwK5YF+Xt7WHUDV0R\nFP+YGiTGmHHi9O5Oo4ICRDCCAkAwDgYDVR0PAQH/BAQDAgeAMB0GA1UdJQQWMBQG\nCCsGAQUFBwMBBggrBgEFBQcDAjAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBSfEpKQ\nwduHX6n3JcLAlQ/3qP1zVjAfBgNVHSMEGDAWgBSTJ0aYA6lRaI6Y1sRCSNsjv1iU\n0jBVBggrBgEFBQcBAQRJMEcwIQYIKwYBBQUHMAGGFWh0dHA6Ly9lNi5vLmxlbmNy\nLm9yZzAiBggrBgEFBQcwAoYWaHR0cDovL2U2LmkubGVuY3Iub3JnLzAeBgNVHREE\nFzAVghNkZXZ2MTkua2xhdWQub25saW5lMBMGA1UdIAQMMAowCAYGZ4EMAQIBMC0G\nA1UdHwQmMCQwIqAgoB6GHGh0dHA6Ly9lNi5jLmxlbmNyLm9yZy83MS5jcmwwggEE\nBgorBgEEAdZ5AgQCBIH1BIHyAPAAdwCi4wrkRe+9rZt+OO1HZ3dT14JbhJTXK14b\nLMS5UKRH5wAAAZYgEV2IAAAEAwBIMEYCIQDdsBDNIWP5pmUeZ20tKnyw3caMC6ZX\n5S77tHzXWLMD8gIhALT55mQW+oHyDWyYuQxFKJDCRaDT6dTZPbrVm1B2CAf7AHUA\nzPsPaoVxCWX+lZtTzumyfCLphVwNl422qX5UwP5MDbAAAAGWIBFdpQAABAMARjBE\nAiBoZTnhet23zQ5QB9i9g4tr2AddXA4LfgiFB0lLy8FMdAIgRBeYhNXsz04Z7W1r\nEHtipPASozvGN+NqG9OEIVhEMuQwCgYIKoZIzj0EAwMDaAAwZQIxAKEYrWFpz1Oq\naifnbA6sX0zlWQ9dGeTjIyypvhcmMbSPoJQVuUGlqvJTO2k+80Q9FwIwFaqRlRmp\nc8TFOW3Pk3I9fSZ4RdEx4TbLrCeFmRHQibiBmXD7cUV+PCxn3+Ywh5mP\n-----END CERTIFICATE-----\n-----BEGIN CERTIFICATE-----\nMIIEVzCCAj+gAwIBAgIRALBXPpFzlydw27SHyzpFKzgwDQYJKoZIhvcNAQELBQAw\nTzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh\ncmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMjQwMzEzMDAwMDAw\nWhcNMjcwMzEyMjM1OTU5WjAyMQswCQYDVQQGEwJVUzEWMBQGA1UEChMNTGV0J3Mg\nRW5jcnlwdDELMAkGA1UEAxMCRTYwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAATZ8Z5G\nh/ghcWCoJuuj+rnq2h25EqfUJtlRFLFhfHWWvyILOR/VvtEKRqotPEoJhC6+QJVV\n6RlAN2Z17TJOdwRJ+HB7wxjnzvdxEP6sdNgA1O1tHHMWMxCcOrLqbGL0vbijgfgw\ngfUwDgYDVR0PAQH/BAQDAgGGMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcD\nATASBgNVHRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQWBBSTJ0aYA6lRaI6Y1sRCSNsj\nv1iU0jAfBgNVHSMEGDAWgBR5tFnme7bl5AFzgAiIyBpY9umbbjAyBggrBgEFBQcB\nAQQmMCQwIgYIKwYBBQUHMAKGFmh0dHA6Ly94MS5pLmxlbmNyLm9yZy8wEwYDVR0g\nBAwwCjAIBgZngQwBAgEwJwYDVR0fBCAwHjAcoBqgGIYWaHR0cDovL3gxLmMubGVu\nY3Iub3JnLzANBgkqhkiG9w0BAQsFAAOCAgEAfYt7SiA1sgWGCIpunk46r4AExIRc\nMxkKgUhNlrrv1B21hOaXN/5miE+LOTbrcmU/M9yvC6MVY730GNFoL8IhJ8j8vrOL\npMY22OP6baS1k9YMrtDTlwJHoGby04ThTUeBDksS9RiuHvicZqBedQdIF65pZuhp\neDcGBcLiYasQr/EO5gxxtLyTmgsHSOVSBcFOn9lgv7LECPq9i7mfH3mpxgrRKSxH\npOoZ0KXMcB+hHuvlklHntvcI0mMMQ0mhYj6qtMFStkF1RpCG3IPdIwpVCQqu8GV7\ns8ubknRzs+3C/Bm19RFOoiPpDkwvyNfvmQ14XkyqqKK5oZ8zhD32kFRQkxa8uZSu\nh4aTImFxknu39waBxIRXE4jKxlAmQc4QjFZoq1KmQqQg0J/1JF8RlFvJas1VcjLv\nYlvUB2t6npO6oQjB3l+PNf0DpQH7iUx3Wz5AjQCi6L25FjyE06q6BZ/QlmtYdl/8\nZYao4SRqPEs/6cAiF+Qf5zg2UkaWtDphl1LKMuTNLotvsX99HP69V2faNyegodQ0\nLyTApr/vT01YPE46vNsDLgK+4cL6TrzC/a4WcmF5SRJ938zrv/duJHLXQIku5v0+\nEwOy59Hdm0PT/Er/84dDV0CSjdR/2XuZM3kpysSKLgD1cKiDA+IRguODCxfO9cyY\nIg46v9mFmBvyH04=\n-----END CERTIFICATE-----\n",
//     "profileId": "cec6d6ae-8901-7b1b-485e-ae9cb9b373d8",
//     "region": "eu-west-1"
//   },
//   "query": "mutation addSensitiveField($sensitiveFieldName: String!, $encryptedFieldValue: String!, $encryptedKey: String!, $certificate: String!, $profileId: ID!, $region: String!) {\n  addSensitiveField(\n    sensitiveFieldName: $sensitiveFieldName\n    encryptedFieldValue: $encryptedFieldValue\n    encryptedKey: $encryptedKey\n    certificate: $certificate\n    profileId: $profileId\n    region: $region\n  ) {\n    certificateARNForCloudfront\n    certificateArn\n    __typename\n  }\n}\n"
// }
async function addSensitiveField(profileId: string, region: string, encryptedFieldValue: string, encryptedKey: string, cert: string) {
    const url = "https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql";
    const token = wafSession?.data?.token;
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    const body = {
        "operationName": "addSensitiveField",
        "variables": {
            "sensitiveFieldName": "nexusCertificate",
            "encryptedFieldValue": encryptedFieldValue,
            "encryptedKey": encryptedKey,
            "certificate": cert,
            "profileId": profileId,
            "region": region
        },
        "query": "mutation addSensitiveField($sensitiveFieldName: String!, $encryptedFieldValue: String!, $encryptedKey: String!, $certificate: String!, $profileId: ID!, $region: String!) {\n  addSensitiveField(\n    sensitiveFieldName: $sensitiveFieldName\n    encryptedFieldValue: $encryptedFieldValue\n    encryptedKey: $encryptedKey\n    certificate: $certificate\n    profileId: $profileId\n    region: $region\n  ) {\n    certificateARNForCloudfront\n    certificateArn\n    __typename\n  }\n}\n"
    }
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
    if (response.ok) {
        console.log("Sensitive field added successfully");
        const data = await response.json();
        // console.log("data:", data);
        return data?.data?.addSensitiveField;
    }
    else {
        console.error("Failed to add sensitive field");
        const errorData = await response.json();
        console.error("Error data:", errorData);
    }
    return null
}


// POST https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql
// Authorization: Bearer {{token}}
// Content-Type: application/json

// {
//   "operationName": "updateDomainCertificate",
//   "variables": {
//     "id": "decb1044-97ae-689c-0087-14d8c5fdc718",
//     "parameterInput": {
//         "certificateARNForCloudfront": "arn:aws:acm:us-east-1:214594577945:certificate/59ffa070-45e3-4ecd-8431-ef6c521bf06d",
//       "certificateARN": "arn:aws:acm:eu-west-1:214594577945:certificate/aaed8cf7-d893-4a08-8792-bb41610ec4a0",
//       "keyName": "devv21b.key.pem",
//       "certificateFile": "data:application/octet-stream;base64,LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUR0VENDQXp5Z0F3SUJBZ0lTQmU3NTVpaGJwMU1jWWYzcmZRK3NsaWxPTUFvR0NDcUdTTTQ5QkFNRE1ESXgKQ3pBSkJnTlZCQVlUQWxWVE1SWXdGQVlEVlFRS0V3MU1aWFFuY3lCRmJtTnllWEIwTVFzd0NRWURWUVFERXdKRgpOakFlRncweU5UQTBNVEF4TlRNMU1UWmFGdzB5TlRBM01Ea3hOVE0xTVRWYU1CNHhIREFhQmdOVkJBTVRFMlJsCmRuWXlNUzVyYkdGMVpDNXZibXhwYm1Vd1dUQVRCZ2NxaGtqT1BRSUJCZ2dxaGtqT1BRTUJCd05DQUFSM2ovTjIKaHNQSWVaeWZhTjN1d3hYRkJSSWNDYVhjK01WMzNoNDhCcld2L2syOFVkVXRGYXROZThId1ZuOFZWbjliTjJkKwpXOE9qVWtlSVl5S1lhTGE2bzRJQ1JEQ0NBa0F3RGdZRFZSMFBBUUgvQkFRREFnZUFNQjBHQTFVZEpRUVdNQlFHCkNDc0dBUVVGQndNQkJnZ3JCZ0VGQlFjREFqQU1CZ05WSFJNQkFmOEVBakFBTUIwR0ExVWREZ1FXQkJReEtmcXAKVytRN3NSV3lvbGFiYmlPSmhjajlNekFmQmdOVkhTTUVHREFXZ0JTVEowYVlBNmxSYUk2WTFzUkNTTnNqdjFpVQowakJWQmdnckJnRUZCUWNCQVFSSk1FY3dJUVlJS3dZQkJRVUhNQUdHRldoMGRIQTZMeTlsTmk1dkxteGxibU55CkxtOXlaekFpQmdnckJnRUZCUWN3QW9ZV2FIUjBjRG92TDJVMkxta3ViR1Z1WTNJdWIzSm5MekFlQmdOVkhSRUUKRnpBVmdoTmtaWFoyTWpFdWEyeGhkV1F1YjI1c2FXNWxNQk1HQTFVZElBUU1NQW93Q0FZR1o0RU1BUUlCTUMwRwpBMVVkSHdRbU1DUXdJcUFnb0I2R0hHaDBkSEE2THk5bE5pNWpMbXhsYm1OeUxtOXlaeTgzT1M1amNtd3dnZ0VFCkJnb3JCZ0VFQWRaNUFnUUNCSUgxQklIeUFQQUFkd0RNK3c5cWhYRUpaZjZWbTFQTzZiSjhJdW1GWEEyWGpiYXAKZmxUQS9rd05zQUFBQVpZZ2pPUENBQUFFQXdCSU1FWUNJUURzSlN4eE1TTU4rMnlaT2N4eVNxR1FVZGdQL2RsTworWFYyYWEwYjJnRWU5d0loQUtrZWJSaUtMcHJNMisyd2plempaRHV4RjYyZFlwcVdtY3k0MDcyUFBBcHZBSFVBCmZWa2VFdUY0S25zY1lXZDhYdjM0MElkY0ZLQk9sWjY1QXkvWkRvd3VlYmdBQUFHV0lJemprQUFBQkFNQVJqQkUKQWlBeENBWDQyNGM1WVAwelpYb2lPV3pyc2lnTEFZbWRhYzRicUVKZm45Tjgrd0lnZjQ0d09jVXhPUnlGemJURApwYjBnMmhwRWpLM2w0UEVrRlFLdEV2SHVNUVV3Q2dZSUtvWkl6ajBFQXdNRFp3QXdaQUl3Tk9GUTJwK1B6WE1qCjVMYW9Lam5OZ09VMmpGMU1wTXJuVWxndGt2MnR3N3Iya2l4WkNjQVpZL2IzYWpiQ3hvTzFBakFKbTF1SER5ZGEKWVdUMkFacWN5MDc5eVdyaFVTTU9YQlpRM1UvekpmRnBTS3Z1aUhGTHUzdDhLdkJpUHJaL3ZXcz0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQotLS0tLUJFR0lOIENFUlRJRklDQVRFLS0tLS0KTUlJRVZ6Q0NBaitnQXdJQkFnSVJBTEJYUHBGemx5ZHcyN1NIeXpwRkt6Z3dEUVlKS29aSWh2Y05BUUVMQlFBdwpUekVMTUFrR0ExVUVCaE1DVlZNeEtUQW5CZ05WQkFvVElFbHVkR1Z5Ym1WMElGTmxZM1Z5YVhSNUlGSmxjMlZoCmNtTm9JRWR5YjNWd01SVXdFd1lEVlFRREV3eEpVMUpISUZKdmIzUWdXREV3SGhjTk1qUXdNekV6TURBd01EQXcKV2hjTk1qY3dNekV5TWpNMU9UVTVXakF5TVFzd0NRWURWUVFHRXdKVlV6RVdNQlFHQTFVRUNoTU5UR1YwSjNNZwpSVzVqY25sd2RERUxNQWtHQTFVRUF4TUNSVFl3ZGpBUUJnY3Foa2pPUFFJQkJnVXJnUVFBSWdOaUFBVFo4WjVHCmgvZ2hjV0NvSnV1aitybnEyaDI1RXFmVUp0bFJGTEZoZkhXV3Z5SUxPUi9WdnRFS1Jxb3RQRW9KaEM2K1FKVlYKNlJsQU4yWjE3VEpPZHdSSitIQjd3eGpuenZkeEVQNnNkTmdBMU8xdEhITVdNeENjT3JMcWJHTDB2YmlqZ2ZndwpnZlV3RGdZRFZSMFBBUUgvQkFRREFnR0dNQjBHQTFVZEpRUVdNQlFHQ0NzR0FRVUZCd01DQmdnckJnRUZCUWNECkFUQVNCZ05WSFJNQkFmOEVDREFHQVFIL0FnRUFNQjBHQTFVZERnUVdCQlNUSjBhWUE2bFJhSTZZMXNSQ1NOc2oKdjFpVTBqQWZCZ05WSFNNRUdEQVdnQlI1dEZubWU3Ymw1QUZ6Z0FpSXlCcFk5dW1iYmpBeUJnZ3JCZ0VGQlFjQgpBUVFtTUNRd0lnWUlLd1lCQlFVSE1BS0dGbWgwZEhBNkx5OTRNUzVwTG14bGJtTnlMbTl5Wnk4d0V3WURWUjBnCkJBd3dDakFJQmdabmdRd0JBZ0V3SndZRFZSMGZCQ0F3SGpBY29CcWdHSVlXYUhSMGNEb3ZMM2d4TG1NdWJHVnUKWTNJdWIzSm5MekFOQmdrcWhraUc5dzBCQVFzRkFBT0NBZ0VBZll0N1NpQTFzZ1dHQ0lwdW5rNDZyNEFFeElSYwpNeGtLZ1VoTmxycnYxQjIxaE9hWE4vNW1pRStMT1RicmNtVS9NOXl2QzZNVlk3MzBHTkZvTDhJaEo4ajh2ck9MCnBNWTIyT1A2YmFTMWs5WU1ydERUbHdKSG9HYnkwNFRoVFVlQkRrc1M5Uml1SHZpY1pxQmVkUWRJRjY1cFp1aHAKZURjR0JjTGlZYXNRci9FTzVneHh0THlUbWdzSFNPVlNCY0ZPbjlsZ3Y3TEVDUHE5aTdtZkgzbXB4Z3JSS1N4SApwT29aMEtYTWNCK2hIdXZsa2xIbnR2Y0kwbU1NUTBtaFlqNnF0TUZTdGtGMVJwQ0czSVBkSXdwVkNRcXU4R1Y3CnM4dWJrblJ6cyszQy9CbTE5UkZPb2lQcERrd3Z5TmZ2bVExNFhreXFxS0s1b1o4emhEMzJrRlJRa3hhOHVaU3UKaDRhVEltRnhrbnUzOXdhQnhJUlhFNGpLeGxBbVFjNFFqRlpvcTFLbVFxUWcwSi8xSkY4UmxGdkphczFWY2pMdgpZbHZVQjJ0Nm5wTzZvUWpCM2wrUE5mMERwUUg3aVV4M1d6NUFqUUNpNkwyNUZqeUUwNnE2QlovUWxtdFlkbC84ClpZYW80U1JxUEVzLzZjQWlGK1FmNXpnMlVrYVd0RHBobDFMS011VE5Mb3R2c1g5OUhQNjlWMmZhTnllZ29kUTAKTHlUQXByL3ZUMDFZUEU0NnZOc0RMZ0srNGNMNlRyekMvYTRXY21GNVNSSjkzOHpydi9kdUpITFhRSWt1NXYwKwpFd095NTlIZG0wUFQvRXIvODRkRFYwQ1NqZFIvMlh1Wk0za3B5c1NLTGdEMWNLaURBK0lSZ3VPREN4Zk85Y3lZCklnNDZ2OW1GbUJ2eUgwND0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=",
//       "certificateFileName": "devv21b.pem",
//       "isCPManaged": false,
//       "uri": "devv21.klaud.online"
//     }
//   },
//   "query": "mutation updateDomainCertificate($parameterInput: CertificateUpdateInput, $id: ID!) {\n  updateDomainCertificate(parameterInput: $parameterInput, id: $id)\n}\n"
// }

// uri e.g. devv21.klaud.online
async function updateCertificate(uri, certificateARNForCloudfront, certificateARN, certId, certPem) {
    const url = "https://cloudinfra-gw.portal.checkpoint.com/app/waf//graphql";
    const token = wafSession?.data?.token;
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    const certPemB64 = btoa(certPem);
    const body = {
        "operationName": "updateDomainCertificate",
        "variables": {
            "id": certId,
            "parameterInput": {
                "certificateARNForCloudfront": certificateARNForCloudfront,
                "certificateARN": certificateARN,
                "keyName": `${uri}-${Date.now()}.key.pem`,
                "certificateFile": `data:application/octet-stream;base64,${certPemB64}`,
                "certificateFileName": `${uri}-${Date.now()}.crt.pem`,
                "isCPManaged": false,
                "uri": "devv21.klaud.online"
            },
        },
        "query": "mutation updateDomainCertificate($parameterInput: CertificateUpdateInput, $id: ID!) {\n  updateDomainCertificate(parameterInput: $parameterInput, id: $id)\n}\n"
    }
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
    if (response.ok) {
        console.log("Certificate updated successfully");
        const data = await response.json();
        // console.log("data:", data);
        return data?.data?.updateDomainCertificate;
    }
    else {
        console.error("Failed to update certificate");
        const errorData = await response.json();
        console.error("Error data:", errorData);
    }
    return null

}




async function waitForTask(taskId: string) {
    console.log("Waiting for taskId:", taskId);
    while (true) {
        const task = await getTask(taskId!)
        // console.log("task:", task);
        const status = task?.status
        console.log("Task status:", status);
        if (status !== "InProgress") {
            // console.log("Task status:", status);
            break;
        }
        // sleep for 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

}

async function publishAndEnforce() {
    console.log("Publishing changes...");
    const publish = await publishChanges()
    console.log("publish:", publish);

    console.log("Enforcing policy...");
    const enforce = await enforcePolicy()
    console.log("enforce:", enforce);

    const taskId = enforce?.id
    console.log("taskId:", taskId);
    const task = await getTask(taskId!)
    console.log("task:", task);
    await waitForTask(taskId!)
}

let PROFILE = "saas-feb15"
let REGION = "eu-west-1"



async function createAsset(assetData: any) {

    const { ASSET_DOMAIN, ASSET_NAME, ASSET_HOST, ASSET_UPSTREAM, ASSET_CERT_KEY , ASSET_CERT_PEM } = assetData;
    const url = Deno.env.get("WAFAUTHURL")!;
    const clientId = Deno.env.get("WAFKEY")!;
    const accessKey = Deno.env.get("WAFSECRET")!;
    wafSession = await wafLogin(url, clientId, accessKey);
    if (!wafSession) {
        console.error("Failed to login to WAF");
        return;
    }

    // console.log("wafSession:", wafSession);
    const profiles = await wafProfiles();
    console.log("wafProfiles:", profiles);

    const profileName = PROFILE
    const pid = await getProfileId(profileName)
    console.log(`${PROFILE} profile id:`, pid);

    let profile = await getProfile(pid!)
    console.log(`${PROFILE} profile:`, profile);

    const profileRegion = REGION
    const deployment = await getDeploymentStatus(pid!, profileRegion)
    console.log(`${PROFILE} deployment:`, deployment);

    console.log('deployments:', deployments(deployment));
    // console.log('validationCnames:', validationCnames(profile));

    const assets = await getAssets()
    console.log("assets:", assets);


    const assetDataForNewAsset = {
        name: ASSET_NAME,
        domain: ASSET_DOMAIN,
        upstream: ASSET_UPSTREAM,
        region: REGION,
        profileId: pid!,
        profileName: PROFILE,
    }

    const asset = await newAsset(assetDataForNewAsset)
    console.log("new asset:", asset);
    const assetId = asset?.id
    console.log("new asset id:", assetId);


    const setHost = await setHostHeader(assetId!, ASSET_HOST)
    console.log("set host header:", setHost);

    await publishAndEnforce();

    const publicKey = await getEncryptionPublicKey(pid!, profileRegion)
    console.log("publicKey:", publicKey);


    const keyFile = ASSET_CERT_KEY //"/tmp/dev008.klaud.online.key"
    const key = await Deno.readTextFile(keyFile)

    const certFile = ASSET_CERT_PEM // "/tmp/dev008.klaud.online.pem"
    const cert = await Deno.readTextFile(certFile)
    console.log("key:", key);
    console.log("cert:", cert);


    const result = await encryptPrivateKey(key, publicKey);
    console.log(result);


    const addSensitiveFieldRes = await addSensitiveField(
        pid!,
        REGION,
        result.encryptedData,
        result.encryptedKey,
        cert
    );
    console.log("addSensitiveFieldRes:", addSensitiveFieldRes);

    console.log('refetching profile')
    profile = await getProfile(pid!)
    console.log(`${PROFILE} profile:`, profile);

    const certificateDomain = profile?.certificateDomains?.find((d) => d.domain === ASSET_DOMAIN)
    console.log("certificateDomain:", certificateDomain);
    const certificateDomainParematerId = certificateDomain?.certificateParameter?.id
    console.log("certificateDomainParematerId:", certificateDomainParematerId);

    const certUpdate = await updateCertificate(
        assetDataForNewAsset.name,
        addSensitiveFieldRes?.certificateARNForCloudfront,
        addSensitiveFieldRes?.certificateArn,
        certificateDomainParematerId!,
        cert
    )
    console.log("certUpdate:", certUpdate);

    await publishAndEnforce();
}

async function loadConfig(filename: string) {
    const configText = await Deno.readTextFile(filename);
    try {
        const config = parseYaml(configText);
        return config;
    } catch (error) {
        console.error("Error parsing YAML:", error);
        return null;
    }
}

async function dnsRecords() {
    const pid = await getProfileId(PROFILE)
    console.log(`${PROFILE} profile id:`, pid);

    let profile = await getProfile(pid!)
    console.log(`${PROFILE} profile:`, profile);

    const profileRegion = REGION
    const deployment = await getDeploymentStatus(pid!, profileRegion)
    // console.log(`${PROFILE} deployment:`, deployment);
    if (deployment) {
        for (const d of deployments(deployment)) {
            // console.log("deployment:", d);
            if (d.deploymentStatus === "READY") {

                console.log(`./cfdns.ts create -n ${d.domain}. -c ${d.recordValue}. -t ${d.recordType}`)
            }
        }
    }

}

async function main() {
    // await create();
    // return;

    const config = await loadConfig("assets.yaml");
    console.log("config:", JSON.stringify(config, null, 2));

    PROFILE = config?.config?.profile || PROFILE
    REGION = config?.config?.region || REGION
    console.log('configured for:', PROFILE, REGION)
     

    const url = Deno.env.get("WAFAUTHURL")!;
    const clientId = Deno.env.get("WAFKEY")!;
    const accessKey = Deno.env.get("WAFSECRET")!;
    wafSession = await wafLogin(url, clientId, accessKey);
    if (!wafSession) {
        console.error("Failed to login to WAF");
        return;
    }


    if (config?.assets) {
        for (const asset of config.assets) {
            // console.log("asset:", asset);
            const assetDataInput = {
                ASSET_DOMAIN: asset.domain,
                ASSET_NAME: asset.name,
                ASSET_HOST: asset.host,
                ASSET_UPSTREAM: asset.upstream,
                ASSET_CERT_PEM: asset.cert_pem,
                ASSET_CERT_KEY: asset.cert_key
            }

            const specificAsset = await getAssets(assetDataInput.ASSET_NAME)
            // console.log("specificAsset:", specificAsset);
            if (specificAsset && specificAsset.length > 0) {
                console.log("ASSET ALREADY EXISTS:", specificAsset[0]);
            } else {
                console.log("Creating asset:", assetDataInput);
                await createAsset(assetDataInput);
            }
        }
    }

    await dnsRecords();

    return;
    const ASSET_DOMAIN = "marigold3.wafaas.klaud.online"
    const ASSET_NAME = ASSET_DOMAIN
    const ASSET_HOST = "www.marigold.cz"
    const ASSET_UPSTREAM = `https://${ASSET_HOST}` // "https://dev.to"

    const ASSET_CERT_PEM = "lego/certificates/_.wafaas.klaud.online.crt"
    const ASSET_CERT_KEY = "lego/certificates/_.wafaas.klaud.online.key"

    const assetDataInput = {
        ASSET_DOMAIN,
        ASSET_NAME,
        ASSET_HOST,
        ASSET_UPSTREAM,
        ASSET_CERT_PEM,
        ASSET_CERT_KEY
    }



    const specificAsset = await getAssets(ASSET_NAME)
    // console.log("specificAsset:", specificAsset);
    if (specificAsset && specificAsset.length > 0) {
        console.log("ASSET ALREADY EXISTS:", specificAsset[0]);

        await dnsRecords();

    } else { // asset not found
        await createAsset(assetDataInput);
    }

}



main()
    .then(() => {
        console.log("done");
    })
    .catch((error) => {
        console.error("Error:", error);
    });