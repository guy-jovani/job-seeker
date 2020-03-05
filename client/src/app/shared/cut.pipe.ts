





import { Pipe, PipeTransform } from '@angular/core';



@Pipe({name: 'cut'})
export class CutPipe implements PipeTransform {
  transform(sentence: string): string {
    const words = sentence.split(' ');
    let newSentence = '';
    if (words.length === 1) {
      if (words[0].length < 12) { return words[0]; }
      return words[0].slice(0, 10) + '..';
    }
    for (const [ind, word] of words.entries()) {
      if (newSentence.length + word.length < 12) {
        newSentence += ' ' + word;
      } else {
        if (ind === 0) { return words[0].slice(0, 10) + '..'; }
        newSentence += '..';
        break;
      }
    }
    return newSentence;
  }
}









