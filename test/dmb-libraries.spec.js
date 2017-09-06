'use strict';
var $input = $('<dmb-input></dmb-input>'),
    $inputDate = $('<dmb-input-date></dmb-input-date>'),
    $inputTime = $('<dmb-input-time></dmb-input-time>'),
    $select = $('<dmb-select></dmb-select>'),
    $button = $('<dmb-button></dmb-button>'),
    result = '';

QUnit.config.autostart = false;

QUnit.test('dmb-button directive', function( assert ) {
    result = dumbo.renderElement($button);
    assert.ok( result.is('button'), 'Render a button' );
});

QUnit.test('dmb-input directive', function( assert ) {
    result = dumbo.renderElement($input);
    assert.ok( result.find('input').length, 'Render an input' );

    $input.attr('validate','required')
    result = dumbo.renderElement($input);
    assert.ok( result.find('input[required]'), 'Render a required input' );

    $input.attr('validate','required')
    result = dumbo.renderElement($input);
    result.find('input[required]').blur();
    assert.ok( result.hasClass('_error'), 'Fire error on required input' );
});

QUnit.test('dmb-input-date directive', function( assert ) {
    result = dumbo.renderElement($inputDate);
    assert.ok( result.find('input[type="text"]').length, 'Render an input' );

    $inputDate.attr('validate','required');
    result = dumbo.renderElement($inputDate);
    assert.ok( result.find('input[required]'), 'Render a required input' );

    result.find('input[required]').blur();
    assert.ok( result.hasClass('_error'), 'Fire error on required input' );
});

QUnit.test('dmb-input-time directive', function( assert ) {
    result = dumbo.renderElement($inputTime);
    assert.ok( result.find('input[type="text"]').length, 'Render an input' );

    $inputTime.attr('validate','required')
    result = dumbo.renderElement($inputTime);
    assert.ok( result.find('input[required]'), 'Render a required input' );

    result.find('input[required]').blur();
    assert.ok( result.hasClass('_error'), 'Fire error on required input' );
});

QUnit.test('dmb-select directive', function( assert ) {
    result = dumbo.renderElement($select);
    assert.ok( result.find('select').length, 'Render a select' );

    $select.attr('validate','required')
    result = dumbo.renderElement($select);
    assert.ok( result.find('select[required]'), 'Render a required select' );

    $select.attr('validate','required')
    result = dumbo.renderElement($select);
    result.find('select[required]').blur();
    assert.ok( result.hasClass('_error'), 'Fire error on required select' );
});

$(window).on('dmbLoaded', function() {
    QUnit.start();
});
