import EmberObject from 'ember-runtime/system/object';
import run from 'ember-metal/run_loop';
import TextArea from 'ember-htmlbars/components/text_area';
import { get } from 'ember-metal/property_get';
import { set as o_set } from 'ember-metal/property_set';

let textArea, TestObject;

function set(object, key, value) {
  run(() => o_set(object, key, value));
}

function append() {
  run(() => textArea.appendTo('#qunit-fixture'));
}

QUnit.module('TextArea', {
  setup() {
    TestObject = window.TestObject = EmberObject.create({
      value: null
    });

    textArea = TextArea.create();
  },

  teardown() {
    run(() => textArea.destroy());

    TestObject = window.TestObject = textArea = null;
  }
});

QUnit.test('should become disabled if the disabled attribute is true', function() {
  textArea.set('disabled', true);
  append();

  ok(textArea.$().is(':disabled'));
});

QUnit.test('should become disabled if the disabled attribute is true', function() {
  append();
  ok(textArea.$().is(':not(:disabled)'));

  run(() => textArea.set('disabled', true));
  ok(textArea.$().is(':disabled'));

  run(() => textArea.set('disabled', false));
  ok(textArea.$().is(':not(:disabled)'));
});

['placeholder', 'name', 'title', 'maxlength', 'rows', 'cols', 'tabindex'].forEach(function(attributeName) {
  QUnit.test(`text area ${attributeName} is updated when setting ${attributeName} property of view`, function() {
    run(() => {
      set(textArea, attributeName, '1');
      textArea.append();
    });

    equal(textArea.$().attr(attributeName), '1', 'renders text area with ' + attributeName);

    run(() => set(textArea, attributeName, '2'));

    equal(textArea.$().attr(attributeName), '2', `updates text area after ${attributeName} changes`);
  });
});

QUnit.test('text area value is updated when setting value property of view', function() {
  run(() => {
    set(textArea, 'value', 'foo');
    textArea.append();
  });

  equal(textArea.$().val(), 'foo', 'renders text area with value');

  run(() => set(textArea, 'value', 'bar'));

  equal(textArea.$().val(), 'bar', 'updates text area after value changes');
});

QUnit.test('value binding works properly for inputs that haven\'t been created', function() {
  run(() => {
    textArea.destroy(); // destroy existing textarea

    let deprecationMessage = '`Ember.Binding` is deprecated. Since you' +
      ' are binding to a global consider using a service instead.';

    expectDeprecation(() => {
      textArea = TextArea.create({
        valueBinding: 'TestObject.value'
      });
    }, deprecationMessage);
  });

  equal(get(textArea, 'value'), null, 'precond - default value is null');
  equal(textArea.$(), undefined, 'precond - view doesn\'t have its layer created yet, thus no input element');

  run(() => set(TestObject, 'value', 'ohai'));

  equal(get(textArea, 'value'), 'ohai', 'value property was properly updated');

  run(() => textArea.append());

  equal(get(textArea, 'value'), 'ohai', 'value property remains the same once the view has been appended');
  equal(textArea.$().val(), 'ohai', 'value is reflected in the input element once it is created');
});

['cut', 'paste', 'input'].forEach(eventName => {
  QUnit.test('should update the value on ' + eventName + ' events', function() {
    run(() => textArea.append());

    textArea.$().val('new value');
    run(() => {
      textArea.trigger(eventName, EmberObject.create({
        type: eventName
      }));
    });

    equal(textArea.get('value'), 'new value', 'value property updates on ' + eventName + ' events');
  });
});

QUnit.test('should call the insertNewline method when return key is pressed', function() {
  let wasCalled;
  let event = EmberObject.create({
    keyCode: 13
  });

  run(() => textArea.append());

  textArea.insertNewline = function() {
    wasCalled = true;
  };

  textArea.trigger('keyUp', event);
  ok(wasCalled, 'invokes insertNewline method');
});

QUnit.test('should call the cancel method when escape key is pressed', function() {
  let wasCalled;
  let event = EmberObject.create({
    keyCode: 27
  });

  run(() => textArea.append());

  textArea.cancel = function() {
    wasCalled = true;
  };

  textArea.trigger('keyUp', event);
  ok(wasCalled, 'invokes cancel method');
});
