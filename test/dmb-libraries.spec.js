'use strict';
var result = null;

QUnit.config.autostart = false;

QUnit.test('dmb-view directive', function( assert ) {
    result = $('.dmb-view');
    assert.ok( result.length, 'Render a view' );
});

QUnit.test('dmb-header directive', function( assert ) {
    result = $('.dmb-header');
    assert.ok( result.length, 'Render a header' );
});

QUnit.test('dmb-content directive', function( assert ) {
    result = $('.dmb-content');
    assert.ok( result.length, 'Render a content' );
});

QUnit.test('dmb-footer directive', function( assert ) {
    result = $('footer .dmb-footer');
    assert.ok( result.length, 'Render a footer' );
});

QUnit.test('dmb-button directive', function( assert ) {
    result = $('.dmb-button');
    assert.ok( result.length, 'Render a button' );
});

QUnit.test('dmb-input directive', function( assert ) {
    result = $('.dmb-input');
    let $input = result.find('input');

    assert.ok( $input.length, 'Render an input' );

//    $input.attr('validate','required')
//    result = dumbo.renderElement($input);
//    assert.ok( result.find('input[required]'), 'Render a required input' );
//
//    $input.attr('validate','required')
//    result = dumbo.renderElement($input);
//    result.find('input[required]').blur();
//    assert.ok( result.hasClass('_error'), 'Fire error on required input' );
});

//QUnit.test('dmb-input-date directive', function( assert ) {
//    result = dumbo.renderElement($inputDate);
//    assert.ok( result.find('input[type="text"]').length, 'Render an input' );
//
//    $inputDate.attr('validate','required');
//    result = dumbo.renderElement($inputDate);
//    assert.ok( result.find('input[required]'), 'Render a required input' );
//
//    result.find('input[required]').blur();
//    assert.ok( result.hasClass('_error'), 'Fire error on required input' );
//});
//
//QUnit.test('dmb-input-time directive', function( assert ) {
//    result = dumbo.renderElement($inputTime);
//    assert.ok( result.find('input[type="text"]').length, 'Render an input' );
//
//    $inputTime.attr('validate','required')
//    result = dumbo.renderElement($inputTime);
//    assert.ok( result.find('input[required]'), 'Render a required input' );
//
//    result.find('input[required]').blur();
//    assert.ok( result.hasClass('_error'), 'Fire error on required input' );
//});
//
//QUnit.test('dmb-select directive', function( assert ) {
//    result = dumbo.renderElement($select);
//    assert.ok( result.find('select').length, 'Render a select' );
//
//    $select.attr('validate','required')
//    result = dumbo.renderElement($select);
//    assert.ok( result.find('select[required]'), 'Render a required select' );
//
//    $select.attr('validate','required')
//    result = dumbo.renderElement($select);
//    result.find('select[required]').blur();
//    assert.ok( result.hasClass('_error'), 'Fire error on required select' );
//});

$(document).on('dmbCompleteRender', function() {
    QUnit.start();
});
