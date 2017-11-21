
# Dagen

Dagen (DATA GENerator) is a tool for generating code for data models using templates.

It works by pre-processing a JSON document in a [JSON Schema](http://json-schema.org)
like format and executing the specified templating using the document as its context.

**Note**: Dagen loosely uses JSON schema, mostly just for the structure of the document. 

Templates are generated using [Nunjucks](https://github.com/mozilla/nunjucks).

## Installation

```sh

  npm install -g @quenk/dagen

```

## Usage

``` sh

  dagen --help 

```

## Stages

The following steps are taken to produce code from JSON documents:

`Reference Resolution` -> `Expansion` -> Substitution -> `Pre-Processing` -> `Code Generation`.

### Reference Resolution

After the target JSON file is read into memory , any keys of the document
that contain a `$ref` property are recognized as imports.

Imports are expected to be paths to files on the local file system and are evaluated
recursively.

Import evaluation is handled as follows:
   1. The file located at the path the import points to is loaded into memory.
   2. The loaded document is recursively scanned for it's own `$ref` properties and resolved.
      Resolution takes place relative to the path of the document being processed.
   3. The imported document is merged with any other keys on the object with the `$ref`.
   4. The `$ref` property is then removed and the final data added to the parent document.
    
If the `$ref` property's values is an array of strings, the process is repeated for
each member.

Example:

```json
{

  "title" : "Something",
  "properties": {

    "name" : {
  
      "type" :"string",
      "$ref": "../mixin.json"

    },
    "age": {

      "$ref": "../age.json"

    },
    "email": {

        "$ref": ["../email.json", "../mixin.json"]

    }

  }

}

//resolved
{

  "title" : "Something",
  "properties": {

    "name" : {
  
      "type" :"string",
      "optional": true

    },
    "age": {

      "type": "number"

    },
    "email": {

        "type": "string",
        "optional": true

    }

  }

}

```

### Expansion

Dagen has a shorthand for specifiying properties of nested objects to reduce clutter of documents.
Specify the parent path, followed by a ':' and the child property like so:

```json
{

 "parent" : { "prop1": 1},
 "parent:prop2": 2,
 "parent:prop3": 3

}

//expanded

{

 "parent": {

    "prop1": 1,
    "prop2": 2,
    "prop3": 3

 }

}
```
Expansion occurs recursively.

### Substitution

Sometimes the value of a property should be different depending on the intended output.
For example the `type` specified may be `string` for application code but `VARCHAR` for SQL.
To support this, aliases can be specified for a particular concern by specifying a property with 
the concern name prefixed by a `@`.

Example:

```json
{

  "properties": {

    "name": {

      "type": "string",
      "@sql": {

        "type": "VARCHAR(32)"

      }

    }

  }

}
```
The value of these aliases are merged into the parent object and the property discarded. If the current
concern is not that of the property key without the `@` it is removed without action.

Concerns are determined by the file extension of the template given.

In addition to the above, sequences such as `${VARIABLE}` are substituted using the `VARIABLE` name as
a path into the provided `vars` object.

Example:

```json

{

  "title" : "${title.user}"

}

//after
{

  "title": "user title"

}

```

### Pre-Processing
This is the stage where plugins are run each plugin can modify the `Program`
before templates are used to render output.

### Code Generation

Dagen uses nunjucks templating framework to generate code. The template specified
on the command line is rendered with the processed document set to the `document`
property.

If no template is specified, the document is printed to `STDOUT` instead.

## Working with Dagen

Dagen expects all documents to be structured as a minimal version of JSON Schema with some
elements from the JSON Schema Validation spec.

### Plugins

Plugins provide the real power to dagen. It ships with none out of the box
but are easily installed via the `--plugin PATH` flag.Plugins are expected
to be regular node modules and the usual rules apply for look up.

A plugin is essentially a function that takes the `Program` and returns a 
new version of it wrapped in a bluebird `Promise`. See the index file
for the type definition of `Program`.

#### After Hook (Pre-Processing)

Once a plugin is applied, it can add to or change the `Program.after` property.
This is an array of plugins that will be called just before the output is 
generated.

Here you can modify the `context` property (see source code for type info)
which will make values available to the template under the `context.<whatever>` path.

The document itself is available at `context.document`.

### Things To Be Aware Of

#### Concern

The concern is computed from the file extension of the template. If there is none
or you want to force it, use the `--concern EXT` option.

#### Types

The type property is not limited to the values defined in the spec but instead can
be whatever value the author desires. It is left up to plugins to decide how
to treat with these values when they encounter them.

#### Meaning
In fact, once dagen restructures a document, it is really up to the plugins
and/or templates to give it meaning.

#### Refs
The treatment of `$ref` is different to JSON Schema, they are just used as paths
to parse as JSON and pointers or remote sources are not supported (yet).

#### Compliance

Even though JSON Schema was chosen as the basis for structuring documents, this
tool does not strive to conform to the spec.
