export default {
    sample: (a, b, c, numSamples) => {
        const f = (c) => (c - a) / (b - a)
        const fOfC = f(c)
        const samples = []

        for (let i = 0; i < numSamples; i++) {
            const U = Math.random()
            let sample = null
            if (0 < U && U < fOfC) {
                sample = a + Math.sqrt(U * (b - a) * (c - a))
            } else {
                sample = b - Math.sqrt((1 - U) * (b - a) * (b - c))
            }
            if (isNaN(sample)) {
                console.log(U, sample, fOfC, a, b, c)
            }
            samples.push(sample)
        }

        return samples
    },
    bin: (data, start, stop, numBins) => {
        console.log(start, stop, numBins)
        const binWidth = (stop - start) / numBins
        const ranges = []
        for (let i=0; i <= numBins; i++) {
            ranges.push(start + (i * binWidth))
        }
        const binnedData = ranges.slice(0, -1).reduce((prev, curr) => ({[curr]: 0, ...prev}), {})
        for (let d of data) {
            for (let i=0; i < numBins; i++) {
                if (ranges[i] <= d && d < ranges[i+1]) {
                    binnedData[ranges[i]] += 1
                }
            }
        }

        // iterate through and round off the bins
        const roundedData = {}
        for (let [key, value] of Object.entries(binnedData)) {
            const roundedKey = Math.floor(key)
            const total = roundedData[roundedKey] || 0
            roundedData[roundedKey] = total + value
        }

        return roundedData
    },
    parseEstimate: function(estimate) {
        const durationRegex = /((?<months>\d+) mo)?(\s?(?<weeks>\d+) wk)?(\s?(?<days>\d+) dy)?/
        return estimate.match(durationRegex).groups
    }
}