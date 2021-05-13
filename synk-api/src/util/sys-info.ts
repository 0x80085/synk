/**
 * Taken from https://github.com/weyoss/redis-smq/blob/8993643738d84c93da6ca935764693fa29dadc2a/src/heartbeat.js#L12
 */

const cpuUsageStats = () => ({
    cpuUsage: process.cpuUsage(),
    time: process.hrtime()
});

// convert (user/system) usage time from micro to milliseconds
function usageTime(time) {
    return time / 1000;
}

// convert hrtime to milliseconds
function hrtime(time) {
    return time[0] * 1e3 + time[1] / 1e6;
}

export function cpuUsage() {
    const timestampDiff = process.hrtime(cpuUsageStats().time);
    const cpuUsageDiff = process.cpuUsage(cpuUsageStats().cpuUsage);
    return {
        percentage: ((usageTime(cpuUsageDiff.user + cpuUsageDiff.system) / hrtime(timestampDiff)) * 100).toFixed(1),
        ...cpuUsageDiff
    };
}
