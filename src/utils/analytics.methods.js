
const Analytics = {
    async average(data, column) {

        let cumul = 0;
        let best = 0;
        let average = 0;
        let lowest = 0;

        for (let d of data) {

            let value = Number(d[column]);
            cumul += value;
            
            if (value > best) 
                best = value;

            if (lowest==0 || value<lowest)
                lowest = value;
        }
        
        average = cumul!=0 ? Math.round(cumul/data.length) : 0;
        
        return { best, average, lowest };
    }
}

module.exports = Analytics;