
{% procedure 'test' , '(IN _id INT)' %}

  SELECT {{context.columns | keys }} FROM test WHERE id = _id;

{% endprocedure %}
