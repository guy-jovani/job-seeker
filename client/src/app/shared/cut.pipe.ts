





import { Pipe, PipeTransform } from '@angular/core';



@Pipe({name: 'cut'})
export class CutPipe implements PipeTransform {
  transform(sentence: string, charsLimit = 10): string {
    const words = sentence.split(' ');
    let newSentence = '';
    if (words.length === 1) {
      if (words[0].length < charsLimit + 2) { return words[0]; }
      return words[0].slice(0, charsLimit) + '..';
    }
    for (const [ind, word] of words.entries()) {
      if (newSentence.length + word.length < charsLimit + 2) {
        newSentence += ' ' + word;
      } else {
        if (ind === 0) { return words[0].slice(0, charsLimit) + '..'; }
        newSentence += '..';
        break;
      }
    }
    return newSentence;
  }
}









