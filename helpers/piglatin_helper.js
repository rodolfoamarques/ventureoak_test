'use strict'; /* jshint ignore:line */

const configs = require( '../config/configs' );


// This function applies the rules of Pig Latin to a provided english word
// The function assumes that the provided english word is valid for translation
function piglatin_converter( english ) {

  // validate that the argument is not empty
  if( !english ) return english;

  let piglatin;
  let gq_regex = /[aeioy]/gi;
  let start_vowel_regex = /[aeiou]/gi;
  let middle_vowel_regex = /[aeiouy]/gi;

  /* Words that start with a vowel (A, E, I, O, U) simply have "WAY" appended to the end of the word. */
  if( english[0].match(start_vowel_regex) ) {
    piglatin = english + 'way';
  }
  else {

    /* Correctly translates "qu" and "gu" (e.g., ietquay instead of uietqay) */
    if( (english.substr(0,2).toLowerCase() == 'qu' || english.substr(0,2).toLowerCase() == 'gu') && english.charAt(2).match(gq_regex) ) {
      piglatin = english.slice(2) + english[0].toLowerCase() + english[1] + 'ay';
    }
    /* Words that start with a consonant have all consonant letters up to the first vowel moved to the end of the word
    (as opposed to just the first consonant letter), and "AY" is appended. ('Y' is counted as a vowel in this context) */
    else {
      let vowelIndice;

      /* Differentiates between "Y" as vowel and "Y" as consonant (e.g. yellow = elloyay and style = ylestay) — except for a very few exceptions */
      if( english[0].toLowerCase() == 'y' ) {
        piglatin = english.substr(1) + english[0].toLowerCase() + 'ay';
      }
      else {
        vowelIndice = english.indexOf( english.match(middle_vowel_regex)[0] );
        piglatin = english.substr( vowelIndice ) + english[0].toLowerCase() + english.substr( 1, vowelIndice-1 ) + 'ay';
      }
    }

  }

  return piglatin;
}


// Function that processes the english word before converting it to Pig latin
// - Checks if the word is composed of alphabetic characters only
// - Checks if the word is compound and separates it into the constituing words (converting each one)
// - Checks if the word is contracted and expands it into full words (converting each one)
// - Checks if the word is hyphenated and converts each of the individual fragments (keeping the hyphen in place)
var translate_word = exports.translate_word = ( word ) => {

  const only_letters_regex = /([^a-zA-Z^\'\-])/g;

  const compound_list = configs.dictionary.compound_list;
  const contraction_list = configs.dictionary.contraction_list;

  // validate that the argument is not empty
  if( !word ) return word;

  /* Words may consist of alphabetic characters only (A-Z and a-z) */
  if( word.match(only_letters_regex) != null ) {
    return word;
  }

  let translated;

  /* Correctly translate compound words */
  if( compound_list[word.toLowerCase()] ) {

    let conversion = compound_list[word.toLowerCase()].split( ' ' );
    conversion.forEach( function( element, index ) {
      conversion[index] = piglatin_converter( element );
    });

    translated = conversion.join( ' ' );
  }
  /* Correctly translate contractions */
  else if( contraction_list[word.toLowerCase()] ) {

    let conversion = contraction_list[word.toLowerCase()].split( ' ' );
    conversion.forEach( function( element, index ) {
      conversion[index] = piglatin_converter( element );
    });

    translated = conversion.join( ' ' );
  }
  /* Hyphenated words are treated as two words */
  else if( word.indexOf('-') != -1 ) {

    let conversion = word.split( '-' );
    conversion.forEach( function( element, index ) {
      conversion[index] = piglatin_converter( element );
    });

    translated = conversion.join( '-' );
  }
  else {
    translated = piglatin_converter( word );
  }

  /* Ensures proper capitalization */
  if( word[0] == word[0].toUpperCase() ) {
    translated = translated[0].toUpperCase() + translated.slice(1);
  }

  return translated;
}


// Function that processes an english text before attempting to translate each word
// Splits the text into words by spaces and punctuation, then processing each word individually
exports.translate_text = ( text ) => {

  /* All punctuation, symbols and whitespaces are not modified (hyphens are included) */
  const punctuation_regex = /([^a-zA-Z0-9])/g;
  let individual_words = text.split( ' ' );

  individual_words.forEach( function( word, i ) {

    let fragments = word.split( punctuation_regex );

    fragments.forEach( function( element, j ) {
      // check if the fragment is '' or non alphanumeric character.
      // if so, no translation no action needs to be taken
      if( element.length <= 1 && element.match(/[^a-zA-Z]/g) ) return;

      fragments[j] = translate_word( element );
    });

    // join each fragment into words
    individual_words[i] = fragments.join( '' );
  });

  // return the words joined into a single text string
  return individual_words.join( ' ' );
}
