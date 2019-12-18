import './scss/app.scss';

let app = new Object();

app.config = {
  // source: window.base_url + 'static/pagodigital/data/co.json'
  source: 'data/co.json',
  documents_type: [
    { 'CC': 'Cédula de Ciudadanía' },
    { 'CE': 'Cédula de Extranjería' },
    { 'CEL': 'Línea Móvil' },
    { 'DE': 'Documento de Identificación Extranjero' },
    { 'IDC': 'Identificador Único de Cliente' },
    { 'NIT': 'NIT' },
    { 'PP': 'Pasaporte' },
    { 'RC': 'Registro Civil' },
    { 'TI': 'Tarjeta de Identidad' }
  ]
}

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
      } else if (field == 'id') {
        $.each(app.config.documents_type, function () {
          let key = Object.keys(this)[0];
          let value = this[key];

          input.append(`<option value='${key}'>${value}</option>`);
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
    type_card: {
      presence: true
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
      presence: true
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

  app.dropDown({
    input: '#type_card',
    source: app.config.source,
    field: 'id'
  });

  $('#type_card').on('change', function () {
    $(this).addClass('pd-control-valid');

    $('#id_card')
      .val('')
      .removeAttr('disabled')
      .focus();

    $('#id_card')
      .attr('placeholder', 'Número de ' + $(this).children('option:selected').text());
  });

  $('#state').on('change', function () {
    $(this).addClass('pd-control-valid');

    app.dropDown({
      input: '#city',
      source: app.config.source,
      field: 'ciudades',
      state: $(this).val()
    });

    $('#city')
      .val('')
      .removeAttr('disabled');
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