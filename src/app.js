/**
 * @todo Chequear validación de teléfono
 */

import './scss/app.scss';

let app = new Object();

app.config = {
  languaje: 'es',
  country: 'co',
  // source: window.base_url + 'static/pagodigital/data/co.json'
  source: 'data/co.json'
};

app.creditCard = new Cleave('#cc_num', {
  creditCard: true,
  creditCardStrictMode: false,
  onCreditCardTypeChanged: type => {
    let creditCardInput = $('#cc_num');

    app.creditCard = {};

    switch (type) {
      case 'unknown':
        creditCardInput.removeClass('amex diners mastercard visa');
        break;
      case 'amex':
        creditCardInput.addClass('amex');
        app.creditCard = {
          number_size: 15 + 2,
          franchise_name: 'amex',
          franchise_id: 30
        };
        app.cc_cvv.properties.blocks = [4]
        break;
      case 'diners':
        creditCardInput.addClass('diners');
        app.creditCard = {
          number_size: 14 + 2,
          franchise_name: 'diners',
          franchise_id: 34
        };
        app.cc_cvv.properties.blocks = [3]
        break;
      case 'mastercard':
        creditCardInput.addClass('mastercard');
        app.creditCard = {
          number_size: 16 + 3,
          franchise_name: 'mastercard',
          franchise_id: 91
        };
        app.cc_cvv.properties.blocks = [3]
        break;
      case 'visa':
        creditCardInput.addClass('visa');
        app.creditCard = {
          number_size: 16 + 3,
          franchise_name: 'visa',
          franchise_id: 90
        };
        app.cc_cvv.properties.blocks = [3]
        break;
    }
  }
});

app.expirationNumber = new Cleave('#cc_expiration', {
  date: true,
  datePattern: ['m', 'y'],
  dateMin: moment().format('YYYY-MM-DD'),
  onValueChanged: element => {
    if (element.target.value.length > 3) {
      let year = element.target.value.split('/');

      if (year[1] < moment().format('YY')) {
        console.log('Error en fecha de expiración');
      }
    }
  }
});

app.cc_cvv = new Cleave('#cc_cvv', {
  blocks: [3]
});

app.autoComplete = prm => {
  $.ajax({
    url: prm.source,
    success: data => {
      typeAhead(data);
    }
  });

  function typeAhead(data) {
    let cityList;

    $.each(data, (_index, element) => {
      if (prm.city == element.departamento) {
        cityList = element.ciudades;
      }
    });

    if (cityList.length == 1) {
      $(prm.input)
        .val(cityList)
        .attr('readonly', true)
        .addClass('pd-control-valid')
        .removeClass('pd-control-invalid');
    } else {
      let engine = new Bloodhound({
        local: cityList,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        datumTokenizer: Bloodhound.tokenizers.whitespace
      });

      engine
        .clear()
        .clearPrefetchCache()
        .clearRemoteCache()
        .initialize(true);

      $(prm.input)
        .typeahead(
          {
            minLength: 2,
            highlight: true
          },
          {
            name: 'cities',
            source: engine
          }
        )
        .on('change blur', function () {
          let match = false;

          $.each(engine.index.datums, function (index) {
            if ($(prm.input).val() == index) {
              match = true;
            }
          });

          if (!match) {
            $(this)
              .removeClass('pd-control-valid')
              .val('');
          } else {
            $(this).addClass('pd-control-valid');
          }
        });

      $(prm.input)
        .on('typeahead:open', () => {
          $('.tt-hint, .tt-input').attr('autocomplete', 'nope');
        });
    }
  }
};

app.dropDown = prm => {
  let input = $(prm.input);
  let source = prm.source;
  let field = prm.field;
  let state = prm.state;

  $.ajax({
    url: source,
    success: resp => {
      let statesList = [];

      if (field == 'ciudades') {
        $.each(resp, (_index, element) => {
          if (element.departamento == state) {
            $(prm.input)
              .find('option:gt(0)')
              .remove();

            statesList.push(element.ciudades);
            $.each(element.ciudades, (_index, element) => {
              input.append(`<option value='${element}'>${element}</option>`);
            });

            $('#city').focus();
          }
        });
      } else {
        $.each(resp, (_index, element) => {
          statesList.push(element.departamento);
        });

        $.each(statesList, (_index, element) => {
          input.append(`<option value='${element}'>${element}</option>`);
        });
      }
    }
  });
};

app.formValidation = _event => {
  validate.extend(validate.validators.datetime, {
    parse: function (value) {
      return moment(value, 'MM/YY').utc();
    },
    format: function (value) {
      return moment()
        .utc(value)
        .format('MM/YY');
    }
  });

  let constraints = {
    name: {
      presence: true,
      length: {
        minimum: 3,
        maximum: 30
      }
    },
    email: {
      email: true,
      presence: true
    },
    cc_num: {
      presence: true,
      length: value => {
        if (value) {
          if (value.length > 15) {
            return { is: app.creditCard.number_size };
          } else {
            return { is: 14 };
          }
        }
      }
    },
    cc_expiration: {
      presence: true,
      datetime: {
        dateOnly: false,
        earliest: moment().utc()
      }
    },
    cc_cvv: {
      presence: true,
      numericality: {
        onlyInteger: true,
        strict: true
      },
      length: value => {
        if (value && app.creditCard.number_size) {
          if (app.creditCard.franchise_name == 'amex') {
            return { is: 4 };
          } else {
            return { is: 3 };
          }
        } else {
          return false;
        }
      }
    },
    id_card: {
      presence: true,
      numericality: {
        onlyInteger: true,
        strict: true
      },
      length: {
        minimum: 6,
        maximum: 11
      }
    },
    state: {
      presence: true
    },
    city: {
      presence: true,
      length: {
        minimum: 2,
        maximum: 70
      }
    },
    address: {
      presence: true
    },
    phone: {
      presence: true,
      numericality: {
        onlyInteger: true,
        strict: true
      },
      length: {
        minimum: 7,
        maximum: 10
      }
    }
  };

  let form = document.querySelector('form#payment_form');
  let values = validate.collectFormValues(form);
  let errors = validate(values, constraints);

  function showErrors(form, errors) {
    $.each(
      form.querySelectorAll('input[name], select[name]'),
      (_index, input) => {
        showErrorsForInput(input, errors);
      }
    );
  }

  function showErrorsForInput(input, errors) {
    if (errors) {
      $.each(errors, index => {
        if (index == input.name) {
          $('#' + input.name).addClass('pd-control-invalid');
        } else {
          $('#' + input.name).addClass('pd-control-valid');
        }
      });
    }
  }

  if (errors) {
    showErrors(form, errors);
  } else {
    $('button').attr('disabled', true);

    if (values.cc_expiration) {
      var expiration = values.cc_expiration.split('/');
    }

    let current_url = window.location.href;
    let oUrl = new URL(current_url);
    let token = oUrl.searchParams.get('token');
    let user_id = oUrl.searchParams.get('user_id');

    let customParams = {
      cc_fr_name: app.creditCard.franchise_name,
      cc_fr_number: app.creditCard.franchise_id,
      cc_exp_month: expiration[0],
      cc_exp_year: expiration[1],
      user_id: user_id,
      token: token,
      cc_number: $('#cc_num').val().replace(/ /g, '')
      // cc_number: app.creditCard.getRawValue()
    };

    $.each(customParams, (index, element) => {
      $('#' + index).val(element);
    });

    $.ajax({
      type: 'POST',
      data: $('#payment_form').serialize()
    }).done(resp => {
      document.write(resp.toString().replace(/ /g, ''));
    });
  }
};

$(document).ready(() => {
  app.dropDown({
    input: '#state',
    source: app.config.source,
    field: 'departamento'
  });

  $('#state').on('change', function () {
    $(this).addClass('pd-control-valid');

    // app.autoComplete({
    //   city: $(this).val(),
    //   input: '#city',
    //   source: app.config.source
    // });

    app.dropDown({
      input: '#city',
      source: app.config.source,
      field: 'ciudades',
      state: $(this).val()
    });

    $('#city')
      .val('')
      .removeAttr('readonly');
  });

  $('#payment_form').submit(e => {
    e.preventDefault();
    app.formValidation(e);
  });

  $('input, select').on('change', function () {
    if ($(this).val() != '') {
      $(this)
        .removeClass('pd-control-invalid')
        .addClass('pd-control-valid');
    } else {
      $(this)
        .removeClass('pd-control-valid')
    }
  });
});
