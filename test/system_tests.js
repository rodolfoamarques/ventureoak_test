'use strict'; /* jshint ignore:line */

var Lab = require( 'lab' );
var code = require( 'code' );

// var db = require( '../database/models' );
var pg_helper = require( '../helpers/piglatin_helper' );

const lab = exports.lab = Lab.script();
// const server = require( '../' ).select( 'api' );


lab.experiment( 'Pig Latin Translation', function() {

  // Run before the first test
  lab.before( done => { done(); } );


  // Run before every single test
  lab.beforeEach( done => { done(); } );


  // Run after the every single test
  lab.afterEach( done => { done(); } );


  // Run after the last test
  lab.after( done => { done(); } );



  // Test single word translation
  lab.test( 'Word Translation', function( done ) {

    var examples = [
      {
        input: "hello",
        expected_output: "ellohay"
      }, {
        input: "y'all'on't",
        expected_output: "ouyay allway illway otnay"
      }, {
        input: "it",
        expected_output: "itway"
      }, {
        input: "ultimate",
        expected_output: "ultimateway"
      }, {
        input: "duck",
        expected_output: "uckday"
      }, {
        input: "Pig",
        expected_output: "Igpay"
      }, {
        input: "Latin",
        expected_output: "Atinlay"
      }, {
        input: "switch",
        expected_output: "itchsway"
      }, {
        input: "glove",
        expected_output: "oveglay"
      }, {
        input: "fruit",
        expected_output: "uitfray"
      }, {
        input: "yellow",
        expected_output: "ellowyay"
      }, {
        input: "style",
        expected_output: "ylestay"
      }, {
        input: "guillotine",
        expected_output: "illotineguay"
      }, {
        input: "query",
        expected_output: "eryquay"
      }, {
        input: "Toothbrush",
        expected_output: "Oothtay ushbray"
      }, {
        input: "is",
        expected_output: "isway"
      }, {
        input: "a",
        expected_output: "away"
      }, {
        input: "compound",
        expected_output: "ompoundcay"
      }, {
        input: "word",
        expected_output: "ordway"
      }, {
        input: "It's",
        expected_output: "Itway ashay"
      }, {
        input: "really",
        expected_output: "eallyray"
      }, {
        input: "cOOl",
        expected_output: "OOlcay"
      }, {
        input: "aNd",
        expected_output: "aNdway"
      }, {
        input: "i'm",
        expected_output: "Iway amway"
      }, {
        input: "tes12r14ting",
        expected_output: "tes12r14ting"
      }, {
        input: "the",
        expected_output: "ethay"
      }, {
        input: "di!ct(ion&ary",
        expected_output: "di!ct(ion&ary"
      }, {
        input: "I'm",
        expected_output: "Iway amway"
      }, {
        input: "camera-ready",
        expected_output: "ameracay-eadyray"
      }, {
        input: "everything",
        expected_output: "everyway ingthay"
      }, {
        input: "-ask",
        expected_output: "-askway"
      }, {
        input: ":)",
        expected_output: ":)"
      }
    ];

    examples.forEach( function( element, index ) {
      var output = pg_helper.translate_word( element.input );

      code.expect( output ).to.be.equal( element.expected_output );
    });

    done();
  });


  // Test sentence translation
  lab.test( 'Sentence Translation', function( done ) {

    var examples = [
      {
        input: 'In the beginning when God created the heavens and the earth,',
        expected_output: 'Inway ethay eginningbay enwhay Odgay eatedcray ethay eavenshay andway ethay earthway,'
      },
      {
        input: 'the earth was a formless void and darkness covered the face of the deep, while a wind from God swept over the face of the waters.',
        expected_output: 'ethay earthway asway away ormlessfay oidvay andway arknessday overedcay ethay acefay ofway ethay eepday, ilewhay away indway omfray Odgay eptsway overway ethay acefay ofway ethay atersway.'
      },
      {
        input: 'Then God said, "Let there be light"; and there was light.',
        expected_output: 'Enthay Odgay aidsay, "Etlay erethay ebay ightlay"; andway erethay asway ightlay.'
      }
    ];

    examples.forEach( function( element, index ) {
      var output = pg_helper.translate_text( element.input );

      code.expect( output ).to.be.equal( element.expected_output );
    });

    done();
  });

});
