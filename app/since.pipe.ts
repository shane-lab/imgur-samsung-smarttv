import { Pipe, PipeTransform } from '@angular/core';

const METRIC_DATE_TIMES: Array<[number, string]> = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
];

@Pipe({
    name: 'since'
})
export class SincePipe implements PipeTransform {

    transform(value: number, subtract = true): string {
        const seconds = Math.floor((+ new Date() - value) / 1000);
    
        const { time, epoch } = this.getTimeSince(seconds);
    
        return `${time} ${epoch + (time === 1 ? '' : 's')} ago`;
    }

    private getTimeSince(seconds: number, index: number = 0): { time: number, epoch: string } {
        const metricDateTime = METRIC_DATE_TIMES[index];
        if (!metricDateTime) {
            return { time: seconds, epoch: 'second' };
        }
        const interval = Math.floor(seconds / metricDateTime[0]);

        return interval > 1 ? { time: interval, epoch: metricDateTime[1] } : this.getTimeSince(seconds, ++index);
    }
}