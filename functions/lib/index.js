"use strict";
/**
 * This Firebase Function will provide a `/splashAuth` route to authenticate a wireless client on a Meraki Network.
 * Example
 * [POST] https://merakicaptiveportal-vuejs.firebaseapp.com/splashAuth/
 *  Body:
        {"clientMac":"24:18:1d:ae:4c:71","nodeMac": "88:15:44:60:1c:1a"}
 *  Returns:
        {
            "ssids": {
                "4": {
                    "isAuthorized": true,
                    "authorizedAt": "2018-07-31 12:12:42 UTC",
                    "expiresAt": "2018-08-01 12:12:42 UTC"
                }
            }
        }
 *
 * The confgis.ts file will contain the required parameters for these calls to function
 *
 * configs.ts:
    export const configs = {
    apiKey: "123456789012345678901234567890", // Enter Your API Key as server default
    apiUrl: "https://n143.meraki.com/api/v0", // API URL using shard number (i.e. n143)
    orgId: "306267",
    ssidNum: 4
};
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
// External Configuration File
const merakiConfigs_1 = require("./merakiConfigs");
const axios_1 = require("axios");
/**
 * Meraki API Handlers
 */
const meraki = axios_1.default.create({
    baseURL: merakiConfigs_1.configs.apiUrl,
    headers: {
        "X-Cisco-Meraki-API-Key": merakiConfigs_1.configs.apiKey,
        "Content-Type": "application/json"
    }
});
function getOrgDevices(orgId) {
    return meraki
        .get("/organizations/" + orgId + "/deviceStatuses")
        .then(res => {
        return res.data;
    })
        .catch(e => {
        console.log("getOrgDevices error", e);
        return e;
    });
}
function getClient(netId, clientMac) {
    return meraki
        .get("/networks/" + netId + "/clients/" + clientMac)
        .then(res => {
        return res.data;
    })
        .catch(e => {
        console.log("getClients error", e);
        return e;
    });
}
function getSsids(netId) {
    return meraki
        .get("/networks/" + netId + "/ssids")
        .then(res => {
        return res.data;
    })
        .catch(e => {
        console.log("getSsids error", e);
        return e;
    });
}
function updateSplashAuth(netId, clientMac, data) {
    return meraki
        .put("/networks/" +
        netId +
        "/clients/" +
        clientMac +
        "/splashAuthorizationStatus", data)
        .then(res => res.data)
        .catch(e => {
        console.log("updateSplashAuth error", e["Error"]);
        return e["Error"] || e;
    });
}
function updatePolicy(netId, clientMac, policy) {
    return meraki
        .put("/networks/" + netId + "/clients/" + clientMac + "/policy?timespan=86400", policy)
        .then(res => res.data)
        .catch(e => {
        console.log("updatePolicy error", e["Error"]);
        return e["Error"] || e;
    });
}
function getGroupPolices(netId) {
    return meraki
        .get("/networks/" + netId + "/groupPolicies")
        .then(res => res.data)
        .catch(e => {
        console.log("getGroupPolicy error", e["Error"]);
        return e["Error"] || e;
    });
}
/**
 * Helper Functions
 */
// Find Device by filtering on the Node MAC
function findDevice(devices, nodeMac) {
    if (devices.length < 0) {
        return false;
    }
    return devices.filter(d => {
        if (d.mac == nodeMac) {
            return d;
        }
    })[0];
}
function findSsid(ssids, ssidName) {
    if (ssids.length < 0) {
        console.log("no SSID found");
        return false;
    }
    return ssids.filter(s => {
        if (s.name == ssidName) {
            return s;
        }
    })[0];
}
// API Routines
function details(nodeMac, clientMac) {
    return __awaiter(this, void 0, void 0, function* () {
        // Organization via Configs
        const orgId = merakiConfigs_1.configs.orgId;
        // Devices via OrgDevices search
        const devices = yield getOrgDevices(orgId);
        console.log("getOrgDevices devices", devices);
        const device = findDevice(devices, nodeMac);
        if (!device["networkId"]) {
            console.log("device not found");
            return "device not found";
        }
        const netId = device["networkId"];
        console.log("device found!", device);
        // Client
        const client = yield getClient(netId, clientMac);
        console.log("client", client);
        // SSID via Client search and compare to SSID list
        const ssidName = client["ssid"];
        const ssids = yield getSsids(netId);
        console.log("ssids", ssids);
        let ssidNum = findSsid(ssids, ssidName)["number"];
        return { orgId, netId, client, device, ssidName, ssidNum };
    });
}
// Authenticate Client
function auth(netId, ssidNum, clientMac, isAuthorized) {
    return __awaiter(this, void 0, void 0, function* () {
        const authBody = {
            ssids: { [ssidNum]: { isAuthorized } }
        };
        console.log("authBody", authBody);
        const clientAuthRes = yield updateSplashAuth(netId, clientMac, authBody)
            .then(res => {
            return res;
        })
            .catch(e => {
            console.log("auth error ", e);
            return e;
        });
        console.log("clientAuthRes", clientAuthRes);
        return clientAuthRes;
    });
}
function policy(netId, clientMac) {
    return __awaiter(this, void 0, void 0, function* () {
        // find policy ID
        const policyName = merakiConfigs_1.configs.policyName;
        console.log("policyName", policyName);
        const policies = yield getGroupPolices(netId);
        console.log("policies for network", policies);
        //const policyId = findPolicy(policies, policyName)["groupPolicyId"];
        const policyId = policies.find(p => {
            return p.name == policyName;
        })["groupPolicyId"];
        if (!policyId) {
            return "policy not found";
        }
        const policy = { devicePolicy: "group", groupPolicyId: policyId };
        console.log("policy", policy);
        // apply policy
        const updatePolicyStatus = yield updatePolicy(netId, clientMac, policy);
        console.log("updatePolicyStatus", updatePolicyStatus);
        return updatePolicyStatus;
    });
}
/**
 * Function Export for Client App
 */
// [POST] /merakiDetails {clientMac, nodeMac}
exports.merakiDetails = functions.https.onRequest((req, res) => {
    const clientMac = req.body.clientMac;
    const nodeMac = req.body.nodeMac;
    details(nodeMac, clientMac).then(data => {
        res.send(data);
    });
});
// [POST] /merakiAuth {netId, clientMac, ssidNum}
exports.merakiAuth = functions.https.onRequest((req, res) => {
    const clientMac = req.body.clientMac;
    const netId = req.body.networkId;
    const ssidNum = req.body.ssidNum;
    const isAuthorized = req.body.isAuthorized;
    // Authenticate Wireless Client
    auth(netId, ssidNum, clientMac, isAuthorized).then(data => {
        res.send(data);
    });
});
// [POST] /merakiPolicy {netId, clientMac}
exports.merakiPolicy = functions.https.onRequest((req, res) => {
    const clientMac = req.body.clientMac;
    const netId = req.body.networkId;
    // apply policy
    policy(netId, clientMac).then(data => {
        res.send(data);
    });
});
//# sourceMappingURL=index.js.map