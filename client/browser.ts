import { readPersistentArray, writePersistentArray } from "./nvram";
import * as resource from "./resource";
import { activeDocument, fetchLockedResource, lockCachedModule, parseURLEx } from "./resource";
import { Buffer } from "buffer";
import * as drcs from "./drcs";
import { IInterpreter } from "./interpreter/interpreter";
import { bmlClearInterval, bmlSetInterval, eventQueueOnModuleLocked, executeEventHandler, processEventQueue, queueAsyncEvent } from "./event";
import { launchDocument as documentLaunchDocument } from "./document";
import { ProgramInfoMessage, ResponseMessage } from "../server/ws_api";
import { playRomSound } from "./romsound";
import { VideoPlayer } from "./player/video_player";
import { BroadcasterDatabase } from "./broadcaster_database";
// browser疑似オブジェクト

export type LockedModuleInfo = [moduleName: string, func: number, status: number];
export interface Browser {
    // Ureg関連機能
    Ureg: string[];
    Greg: string[];
    // EPG関連機能
    epgGetEventStartTime(event_ref: string): Date | null;
    epgGetEventDuration(event_ref: string): number;
    epgTune(service_ref: string): number;
    epgTuneToComponent(component_ref: string): number;
    // epgTuneToDocument(documentName: string): number;
    epgIsReserved(event_ref: string, startTime?: Date): number;
    epgReserve(event_ref: string, startTime?: Date): number;
    epgCancelReservation(event_ref: string): string;
    epgRecIsReserved(event_ref: string, startTime?: Date): number;
    epgRecReserve(event_ref: string, startTime?: Date): number;
    epgRecCancelReservation(event_ref: string): number;
    setCurrentDateMode(time_mode: number): number;
    // 番組群インデックス関連機能
    // 非運用
    // シリーズ予約機能
    // シリーズ予約機能をもつ受信機では実装することが望ましい。
    // 永続記憶機能
    // readPersistentString(filename: string): string;
    // readPersistentNumber(filename: string): number;
    readPersistentArray(filename: string, structure: string): any[] | null;
    // writePersistentString(filename: string, buf: string, period?: Date): number;
    // writePersistentNumber(filename: string, data: number, period?: Date): number;
    writePersistentArray(filename: string, structure: string, data: any[], period?: Date): number;
    // copyPersistent(srcUri: string, dstUri: string): number;
    // getPersistentInfoList(type: string): any[];
    // deletePersistent(filename: string): number;
    // getFreeSpace(type: string): number;
    // 双方向機能－遅延発呼
    // 非運用
    // 双方向機能－BASIC手順 非対応であればエラーを返すこと
    connect(tel: string, speed: number, timeout: number): number;
    connect(tel: string, hostNo: string, bProvider: boolean, speed: number, timeout: number): number;
    disconnect(): number;
    // sendBinaryData(uri: string, timeout: number): number;
    // receiveBinaryData(uri: string, timeout: number): number;
    sendTextData(text: string, timeout: number): number;
    receiveTextData(text: string, timeout: number): number;
    // 双方向機能－TCP/IP
    // 非対応であればエラーを返すこと
    setISPParams(ispname: string, tel: string, bProvider: boolean, uid: string, passwd: string, nameServer1: string, nameServer2: string, softCompression: boolean, headerCompression: boolean, idleTime: number, status: number, lineType?: number): number;
    getISPParams(): any[] | null;
    connectPPP(tel: string, bProvider: boolean, uid: string, passwd: string, nameServer1: string, nameServer2: string, softCompression: boolean, headerCompression: boolean, idleTime: number): number;
    connectPPPWithISPParams(idleTime?: number): number;
    disconnectPPP(): number;

    getConnectionType(): number;
    isIPConnected(): number;
    confirmIPNetwork(destination: string, confirmType: number, timeout?: number): [boolean, string | null, number | null] | null;
    transmitTextDataOverIP(uri: string, text: string, charset: string): [number, string, string];
    // 非運用
    // saveHttpServerFileAs
    // saveHttpServerFile
    // sendHttpServerFileAs
    // saveFtpServerFileAs
    // saveFtpServerFile
    // sendFtpServerFileAs
    // setDelayedTransmissionData

    // オプション
    sendTextMail(subject: string, body: string, toAddress: string, ...ccAddress: string[]): [number, number];
    sendMIMEMail(subject: string, src_module: string, toAddress: string, ...ccAddress: string[]): [number, number];
    setCacheResourceOverIP(resources: string[]): number;
    // 双方向機能－回線接続状態を取得する機能 
    // 非対応であれば[1]-[4]に空文字列を返すこと
    getPrefixNumber(): [number, string, string, string, string];
    // 双方向機能－大量呼受付サービスを利用する通信機能
    // 非対応であればエラーを返す
    vote(tel: string, timeout: number): number;
    // 双方向機能－CASを用いた暗号化通信のための機能
    // startCASEncryption(provider: number, centerID: number): number;
    // endCASEncryption(): number;
    // transmitWithCASEncryption(sendData: string, timeout: number): any[];
    // 双方向機能－CAS を用いない共通鍵暗号による通信 
    // 非運用
    reloadActiveDocument(): number;
    getNPT(): number;
    getProgramRelativeTime(): number;
    isBeingBroadcast(event_ref: string): boolean;
    // lockExecution(): number;
    // unlockExecution(): number;
    lockModuleOnMemory(module: string): number
    unlockModuleOnMemory(module: string): number
    setCachePriority(module: string, priority: number): number;
    // getTuningLinkageSource(): string;
    // getTuningLinkageType(): number;
    // getLinkSourceServiceStr(): string;
    // getLinkSourceEventStr(): string;
    getIRDID(type: number): string | null;
    getBrowserVersion(): string[];
    getProgramID(type: number): string | null;
    getActiveDocument(): string | null;

    lockScreen(): number;
    unlockScreen(): number;
    getBrowserSupport(sProvider: string, functionname: string, additionalinfo?: string): number;
    launchDocument(documentName: string, transitionStyle?: string): number;
    // option
    // launchDocumentRestricted(documentName: string, transitionStyle: string): number;
    quitDocument(): number;
    // option
    // launchExApp(uriname: string, MIME_type?: string, ...Ex_info: string[]): number;
    getFreeContentsMemory(number_of_resource?: number): number;
    isSupportedMedia(mediaName: string): number;
    detectComponent(component_ref: string): number;
    lockModuleOnMemoryEx(module: string): number
    unlockModuleOnMemoryEx(module: string): number;
    unlockAllModulesOnMemory(): number;
    getLockedModuleInfo(): LockedModuleInfo[] | null;
    getBrowserStatus(sProvider: string, functionname: string, additionalinfo: string): number;
    getResidentAppVersion(appName: string): any[] | null;
    isRootCertificateExisting(root_certificate_type: number, root_certificate_id: number, root_certificate_version?: number): number;
    getRootCertificateInfo(): any[] | null;
    // option
    // startResidentApp(appName: string, showAV: number, returnURI: string, ...Ex_info: string[]): number;
    // startExtraBrowser(browserName: string, showAV: number, returnURI: string, uri: string): number;
    // transmitDataToSmartDevice(profile: string, data: string, additionalinfo?: string): number;

    // 受信機音声制御
    playRomSound(soundID: string): number;
    // タイマ機能
    sleep(interval: number): number | null;
    // setTimeout(func: string, interval: number): number;
    setInterval(func: string, interval: number, iteration: number): number;
    clearTimer(timerID: number): number;
    pauseTimer(timerID: number): number;
    resumeTimer(timerID: number): number;
    setCurrentDateMode(time_mode: number): number;
    // 外字機能
    loadDRCS(DRCS_ref: string): number;
    // unloadDRCS(): number;
    // 外部機器制御機能
    // 運用しない
    // その他の機能
    random(num: number): number;
    subDate(target: Date, base: Date, unit: number): number;
    addDate(base: Date, time: number, unit: number): Date | number;
    formatNumber(value: number): string | null;
    // 字幕表示制御機能
    // setCCStreamReference(stream_ref: string): number;
    // getCCStreamReference(): string | null;
    setCCDisplayStatus(language: number, status: boolean): number;
    getCCDisplayStatus(language: number): number;
    getCCLanguageStatus(language: number): number;
    // ディレクトリ操作関数 ファイル操作関数 ファイル入出力関数
    // 非運用
    // 問い合わせ関数
    // 非運用/オプション
    // データカルーセル蓄積関数
    // 非運用
    // ブックマーク制御機能
    writeBookmarkArray(filename: string, title: string, dstURI: string, expire_str: string, bmType: string, linkMedia: string, usageFlag: string, extendedStructure?: string, extendedData?: any[]): number;
    readBookmarkArray(filename: string, bmType?: string, extendedStructure?: string): any[] | null;
    deleteBookmark(filename: string): number;
    lockBookmark(filename: string): number;
    unlockBookmark(filename: string): number;
    getBookmarkInfo(): [number, number, string];
    getBookmarkInfo2(regison_name: string): [number, number, string];
    // オプション
    // startResidentBookmarkList(): number;
    // 印刷
    // オプション
    // IPTV連携機能
    // オプション
    // AITコントロールドアプリケーション連携機能
    // オプション
}

export const browser: Browser = {
    Ureg: [...new Array(64)].map(_ => ""),
    Greg: [...new Array(64)].map(_ => ""),
    setCurrentDateMode(time_mode: number): number {
        console.log("setCurrentDateMode", time_mode);
        if (time_mode == 0) {
            browserState.currentDateMode = 0;
        } else if (time_mode == 1) {
            browserState.currentDateMode = 1;
        } else {
            return NaN;
        }
        return 1; // 成功
    },
    getProgramRelativeTime(): number {
        console.log("getProgramRelativeTime");
        return 10; // 秒
    },
    subDate(target: Date, base: Date, unit: number) {
        const sub = target.getTime() - base.getTime();
        if (unit == 1) {
            return (sub / 1000) | 0;
        } else if (unit == 2) {
            return (sub / (1000 * 60)) | 0;
        } else if (unit == 3) {
            return (sub / (1000 * 60 * 60)) | 0;
        } else if (unit == 4) {
            return (sub / (1000 * 60 * 60 * 24)) | 0;
        } else if (unit == 5) {
            return (sub / (1000 * 60 * 60 * 24 * 7)) | 0;
        }
        return sub | 0;
    },
    addDate(base: Date, time: number, unit: number): Date | number {
        if (Number.isNaN(time)) {
            return base;
        }
        if (unit == 0) {
            return new Date(base.getTime() + time);
        } else if (unit == 1) {
            return new Date(base.getTime() + (time * 1000));
        } else if (unit == 2) {
            return new Date(base.getTime() + (time * 1000 * 60));
        } else if (unit == 3) {
            return new Date(base.getTime() + (time * 1000 * 60 * 60));
        } else if (unit == 4) {
            return new Date(base.getTime() + (time * 1000 * 60 * 60 * 24));
        } else if (unit == 5) {
            return new Date(base.getTime() + (time * 1000 * 60 * 60 * 24 * 7));
        }
        return NaN;
    },
    unlockModuleOnMemory(module: string): number {
        console.log("unlockModuleOnMemory", module);
        const { componentId, moduleId } = parseURLEx(module);
        if (componentId == null || moduleId == null) {
            return NaN;
        }
        return resource.unlockModule(componentId, moduleId, false) ? 1 : NaN;
    },
    unlockModuleOnMemoryEx(module: string): number {
        console.log("unlockModuleOnMemoryEx", module);
        const { componentId, moduleId } = parseURLEx(module);
        if (componentId == null || moduleId == null) {
            return NaN;
        }
        return resource.unlockModule(componentId, moduleId, true) ? 1 : NaN;
    },
    unlockAllModulesOnMemory(): number {
        console.log("unlockAllModulesOnMemory");
        resource.unlockAllModule();
        return 1; // NaN => fail
    },
    lockModuleOnMemory(module: string): number {
        console.log("lockModuleOnMemory", module);
        const { componentId, moduleId } = parseURLEx(module);
        if (componentId == null || moduleId == null) {
            return NaN;
        }
        // exと違ってロック済みならイベント発生しないはず
        if (resource.isModuleLocked(componentId, moduleId)) {
            return 1;
        }
        if (!resource.getPMTComponent(componentId)) {
            console.error("lockModuleOnMemory: component does not exist in PMT", module);
            return -1;
        }
        if (!resource.moduleExistsInDownloadInfo(componentId, moduleId)) {
            console.error("lockModuleOnMemory: component does not exist in DII", module);
            return -1;
        }
        const cachedModule = lockCachedModule(componentId, moduleId, "lockModuleOnMemory");
        if (!cachedModule) {
            console.error("lockModuleOnMemory: module not cached", module);
            resource.requestLockModule(module, componentId, moduleId, false);
            return 1;
        }
        // イベントハンドラではモジュール名の大文字小文字がそのままである必要がある?
        eventQueueOnModuleLocked(module, false, 0);
        return 1;
    },
    lockModuleOnMemoryEx(module: string): number {
        console.log("lockModuleOnMemoryEx", module);
        const { componentId, moduleId } = parseURLEx(module);
        if (componentId == null || moduleId == null) {
            return NaN;
        }
        if (!resource.getPMTComponent(componentId)) {
            console.error("lockModuleOnMemoryEx: component does not exist in PMT", module);
            return -3;
        }
        if (!resource.moduleExistsInDownloadInfo(componentId, moduleId)) {
            console.error("lockModuleOnMemoryEx: component does not exist in DII", module);
            eventQueueOnModuleLocked(module, true, -2);
            return 1;
        }
        const cachedModule = lockCachedModule(componentId, moduleId, "lockModuleOnMemoryEx");
        if (!cachedModule) {
            console.error("lockModuleOnMemoryEx: module not cached", module);
            resource.requestLockModule(module, componentId, moduleId, true);
            // OnModuleLockedのstatusで返ってくる
            return 1;
        }
        // イベントハンドラではモジュール名の大文字小文字がそのままである必要がある?
        eventQueueOnModuleLocked(module, true, 0);
        return 1;
    },
    lockScreen() {
        console.log("lockScreen");
        return 1;
    },
    unlockScreen() {
        console.log("unlockScreen");
        return 1;
    },
    getBrowserSupport(sProvider: string, functionname: string, additionalinfo?: string): number {
        console.log("getBrowserSupport", sProvider, functionname, additionalinfo);
        if (sProvider === "ARIB") {
            if (functionname === "BMLversion") {
                if (additionalinfo == null) {
                    return 1;
                } else {
                    const [major, minor] = additionalinfo.split(".").map(x => Number.parseInt(x));
                    if (major == null || minor == null) {
                        return 0;
                    }
                    if ((major < 3 && major >= 0) || (major === 3 && minor === 0)) {
                        return 1;
                    }
                    return 0;
                }
            } else if (functionname === "APIGroup") {
                if (additionalinfo === "Ctrl.Basic") {
                    return 1;
                } else if (additionalinfo === "Ctrl.Screen") {
                    return 1;
                } else if (additionalinfo === "Ctrl.Cache2") {
                    return 1;
                } else if (additionalinfo === "Ctrl.Version") {
                    return 1;
                } else if (additionalinfo === "Ctrl.Basic2") {
                    // detectComponent
                    return 1;
                }
            }
        } else if (sProvider === "nvram") {
            if (functionname === "NumberOfBSBroadcasters") {
                if (additionalinfo === "23") {
                    return 1;
                }
            } else if (functionname === "BSspecifiedExtension") {
                if (additionalinfo === "48") {
                    return 1;
                }
            } else if (functionname === "NumberOfCSBroadcasters") {
                if (additionalinfo === "23") {
                    return 1;
                }
            }
        }
        return 0;
    },
    getBrowserStatus(sProvider: string, functionname: string, additionalinfo: string): number {
        console.log("getBrowserStatus", sProvider, functionname, additionalinfo);
        return 0;
    },
    launchDocument(documentName: string, transitionStyle?: string): number {
        console.log("%claunchDocument", "font-size: 4em", documentName, transitionStyle);
        documentLaunchDocument(documentName);
        browserState.interpreter.destroyStack();
        throw new Error("unreachable!!");
    },
    reloadActiveDocument(): number {
        console.log("reloadActiveDocument");
        return browser.launchDocument(browser.getActiveDocument()!);
    },
    readPersistentArray(filename: string, structure: string): any[] | null {
        console.log("readPersistentArray", filename, structure);
        return readPersistentArray(filename, structure);
    },
    writePersistentArray(filename: string, structure: string, data: any[], period?: Date): number {
        console.log("writePersistentArray", filename, structure, data, period);
        return writePersistentArray(filename, structure, data, period);
    },
    random(num: number): number {
        return Math.floor(Math.random() * num) + 1;
    },
    getActiveDocument(): string | null {
        return activeDocument;
    },
    getResidentAppVersion(appName: string): any[] | null {
        console.log("getResidentAppVersion", appName);
        return null;
    },
    getLockedModuleInfo(): LockedModuleInfo[] | null {
        console.log("getLockedModuleInfo");
        const l: LockedModuleInfo[] = [];
        for (const { module, isEx } of resource.getLockedModules()) {
            l.push([module, isEx ? 2 : 1, 1]);
        }
        return l;
    },
    detectComponent(component_ref: string) {
        const { componentId } = parseURLEx(component_ref);
        if (componentId == null) {
            return NaN;
        }
        if (resource.getPMTComponent(componentId)) {
            return 1;
        } else {
            return 0;
        }
    },
    getProgramID(type: number): string | null {
        function toHex(n: number | null | undefined, d: number): string | null {
            if (n == null) {
                return null;
            }
            return "0x" + n.toString(16).padStart(d, "0");
        }
        if (type == 1) {
            return toHex(resource.currentProgramInfo?.eventId, 4);
        } else if (type == 2) {
            return toHex(resource.currentProgramInfo?.serviceId, 4);
        } else if (type == 3) {
            return toHex(resource.currentProgramInfo?.originalNetworkId, 4);
        } else if (type == 4) {
            return toHex(resource.currentProgramInfo?.transportStreamId, 4);
        }
        return null;
    },
    sleep(interval: number): number | null {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/api/sleep?ms=" + interval, false);
        xhr.send(null);
        return 1;
    },
    loadDRCS(DRCS_ref: string): number {
        console.log("loadDRCS", DRCS_ref);
        const { componentId, moduleId, filename } = parseURLEx(DRCS_ref);
        if (componentId == null || moduleId == null) {
            return NaN;
        }
        const res = fetchLockedResource(DRCS_ref);
        if (res?.data == null) {
            return NaN;
        }
        const id = `drcs-${componentId.toString(16).padStart(2, "0")}/${moduleId.toString(16).padStart(2, "0")}/${filename}`;
        const css = document.getElementById(id);
        if (!css) {
            const style = document.createElement("style");
            style.id = id;
            let tc = "";
            for (const [id, fontFamily] of [
                [1, "丸ゴシック"],
                [2, "角ゴシック"],
                [3, "太丸ゴシック"],
            ]) {
                const glyph = drcs.loadDRCS(Buffer.from(res.data), id as number);
                const ttf = drcs.toTTF(glyph);
                const url = URL.createObjectURL(new Blob([ttf.buffer]));
                tc += `@font-face {
    font-family: "${fontFamily}";
    src: url("${url}");
    unicode-range: U+EC00-FE00;
}
`;
            }
            style.textContent = tc;
            document.head.appendChild(style);
        }
        return 1;
    },
    playRomSound(soundID: string): number {
        console.log("playRomSound", soundID);
        const groups = /romsound:\/\/(?<soundID>\d+)/.exec(soundID)?.groups;
        if (groups != null) {
            playRomSound(Number.parseInt(groups.soundID));
        }
        return 1;
    },
    getBrowserVersion(): string[] {
        return ["BMLHTML", "BMLHTML", "001", "000"];
    },
    getIRDID(type: number): string | null {
        console.log("getIRDID", type);
        if (type === 5) {
            return "00000000000000000000";
        }
        return null;
    },
    isIPConnected(): number {
        console.log("isIPConnected");
        return 0;
    },
    getConnectionType(): number {
        console.log("getConnectionType");
        return NaN;
    },
    setInterval(evalCode: string, msec: number, iteration: number): number {
        const handle = bmlSetInterval(() => {
            iteration--;
            if (iteration === 0) {
                bmlClearInterval(handle);
            }
            queueAsyncEvent(async () => {
                return await executeEventHandler(evalCode);
            });
            processEventQueue();
        }, msec);
        console.log("setInterval", evalCode, msec, iteration, handle);
        return handle;
    },
    clearTimer(timerID: number): number {
        console.log("clearTimer", timerID);
        bmlClearInterval(timerID);
        return 1;
    },
} as Browser;


export const browserState = {
    currentDateMode: 0,
    interpreter: null! as IInterpreter,
    currentProgramInfo: null as (ProgramInfoMessage | null),
    player: null as (VideoPlayer | null),
    broadcasterDatabase: new BroadcasterDatabase(),
};

resource.resourceEventTarget.addEventListener("message", ((event: CustomEvent) => {
    const msg = event.detail as ResponseMessage;
    if (msg.type === "programInfo") {
        if (msg.serviceId != null && msg.serviceId !== browserState.currentProgramInfo?.serviceId) {
            // TR-B14 第二分冊 5.12.6.1
            if (browserState.currentProgramInfo != null) {
                console.log("serviceId changed", msg.serviceId, browserState.currentProgramInfo?.serviceId)
            }
            browser.Ureg![0] = "0x" + msg.serviceId.toString(16).padStart(4);
            for (let i = 1; i < 64; i++) { // FIXME
                browser.Ureg![i] = "";
            }
        }
    }
}) as EventListener);
