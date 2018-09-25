# Data Document Schema Specification

The Data Document Schema Specification (DDSS) describes the syntax of the Data Generator tool (Dagen). 

Dagen is primarily used to generate boilerplate output structured around a
single data model or entity in an application's domain.

The syntax is loosely based on JSON schema and indeed every  
DDSS file is essentially a schema but not necessarily a valid JSON schema.

The specification's syntax provides for a set of pre-processing directives
which are meant to ease the burden of describing complex schemas.

A Data Document may look like the following:

```json
{

  "type": "object",

  "title": "Person",
  
  "definitions": {

    "ts:date": "Date",
 
    "sql:date": "DATETIME",

    "address": {

        "type": "string",

        "validation:checks": ["address", "exists"]

    }

  },
  "properties": {

    "name": {

      "type": "object",

      "properties": {

        "first.type": "string",

        "last.type": "string"

      }

    },
    "age": "#date",

    "addresses": {

      "type": "array",

      "items": {

        "type": "#address",

      }

    },

    "$ref": "./auditing.json"

  },
  "procedures": {

    "get": {

      "params": {

        "id" : {

          "sql:type": "INT",

          "ts:type": "number",

          "ts:return": "Promise<any>"

        },

        "ts:conn.type": "any"

      }

    }

  }

}
```

The example above demonstrates following:

1. A root document (or the entire Data Document Schema itself).
2. Schema types
3. Namespaces
4. Short-hand.
5. Fragments.
6. User properties.

Given a certain set of parameters, the processing program may convert the
example to the following final value before actually generating output:

```json
{

  "type": "object",

  "title": "Person",

  "properties": {

    "name": {

      "type": "object",

      "properties": {

        "first": {
          
          "type": "string"

        },
        "last": {
        
          "type": "string"

        }

      },

    },
      
    "age": {

      "type": "DATETIME"

    },
    "addresses": {

      "type": "array",

        "items": {

          "type": "string",

        }

      },

    "last_modified": {

      "type": "date"

    }

  },
  "procedures": {

    "get": {

      "params": {

        "id" : {

          "type": "INT",

        }

      }

    }

  }

}
```

## Root Schema

The root schema is essentially the entire schema for a data document.
This root schema must be a valid JSON document and posses the following properties:

### Type

The `type` property is required and indicates the type of the schema which
must have a value of either "object" or "sum".

If the type is "object" then the schema must comply with the "Object Type" syntax
section of this specification.

If the type is "sum" then the schema must comply with the "Sum Type" section of this specification. Additionally, all its variants must be of type "object".

### Definitions

The `definitions` property is optional and is used to make the processing program
aware of user defined types that may be used later on in the schema.
 
See the "Defined Types" section for more information.

## Schema Types

For the purposes of this specification, type refers to a specific schema a 
value may conform to.

A type is either a complex type, a defined type, or an assumed external type.
 
### Complex Types

A complex type is used to describe data that is either an array, object or is 
the algebraic sum of other types (Sum Type).

There are three supported complex types:
1. Object Type
2. Array Type
3. Sum Type
 
#### Object Type

The Object Type is the schema for objects or records of a data object.
To be considered an Object Type, a schema's `type` property's value must
be the string "object".

Object Types may optionally have the following properties:

1. `properties`
2. `additionalProperties`

##### Properties

The `properties` property if present, must be a JSON object with at least one property. 

Each property's value in this object must be either a schema object or a string.

If the property's value is a string it will be resolved later by 
the processing program.

Example: 

```json
{

 "type" "object",
 "properties": {

   "name": "string",

   "age": {

      "type": "number",

   },
   "tags": {

     "type": "array",
     "items": {

        "type": "string"

      }

   }

  } 

}
```
##### Additional Properties

An Object Type may also have an `additionalProperties` property. If present,
this must be a schema or a string that can be resolved to a schema.

The purpose of this property is to indicate the schema for each properties
on the data model whose names may not be known until runtime. For example
when the schema is a random access map.

#### Array Type

The Array Type is the schema used for arrays/lists.

To be considered an Array Type a schema's `type` property's value must be 
the string "array".

Array Types must have following properties:

1. items

##### Items

The `items` property is the schema for members of the array and
must be a valid a schema or a string that can be resolved to one.

Example:

```json

{

  "type": "array",
  "items": {

     "type": "number"
     
  }

}

```

#### Sum Type

The sum type is used for cases where the schema may be different depending on 
user determined conditions. To be a considered a Sum Type, a schema's
`type` property's value must be the string "sum". 

Sum type schema must have the following properties: 

1. variants

##### Variants
The `variants` property must be a JSON object where each property is a valid
schema or a string that can be resolved to one.

Example:

```json
{

   "type": "sum",
   "discriminator": {

     "type": "

   },
   "variants": {

      "read": "string",

      "write": "int"

   }
}

```

Example:

```json

   {

     "type":"sum",
     "variants" {

       "read": "string",

       "write": "int"

     }
     
   }


```

#### Global Properties

Global properties are those properties that can be used on any schema types.
The currently defined global properties are:

1. `id`
2. `title`
3. `optional`

##### Id

The `id` property if present, uniquely identities a schema within the document and
must be a string.

##### Title

The `title` property if present, can be used by the processing program to refer
to the schema and must be a string.

##### Optional

The `optional` property if present indicates to the processing program whether
a schema is optional or not and must be a boolean.


### Defined Types

Defined Types or User Defined Types allow users of the processing program to
avoid boilerplate by re-using schema.

Defined Types must be declared in the `definitions` property of the root schema
which if present, must be an object where each key is a valid schema or
a string that can be resolved to one.

During processing the processing program will make these schema available for 
use via their names.

#### Usage

Once a schema has been defined it can be used as the "type" value of 
a schema by prefixing the defined name with the symbol "#".

This syntax is only recognized in schema appearing somewhere within 
the `properties`, `additionalProperties` or `variants` 
sections of the root schema.

Example:
```json

{

  "type": "object",
  definitions: {

   "name" : "string"

  },
  "properties": {

     "name": {

        "type": "object",
        "properties": {

            "first": "#name",

            "last": "#name"

        }
        
     },
     "alias": "#name"

  }

}

```

If the processing program is unable to resolve a defined type by its name it has
two options:

1. Report the error to the user and terminate.
2. Treat the un-prefixed name of the type as an assumed external type.

Processing programs should allow user to configure which is appropriate.


### External Types

An external type is a type that is never given meaning by the processing program. 
That meaning is instead left up to the template chosen (if any) to output data
or its execution environment.

An external type cannot be "object", "array" or "sum" and must not be prefixed with 
a "#".

## Namespaces

Properties occurring within a Data Document Schema may be namespaced.
Namespacing allows the user to describe multiple values of a property depending
on the evaluation context.

Example: 

```json
{

  "sql:type": "VARCHAR(100)",
  "js:type": "string"

}

```

During processing, the processing program will determine which value to
use and which ones to discard.

Namespaces can be used anywhere in a schema document.

A namespace name must conform to the following regular expression : 
`[a-zA-Z$][a-zA-Z0-9_-]*`.

### Namespace Resolution

Processing programs should provide a mechanism where users can specify which
namespaces to keep and which to disregard. If more than one namespace is
specified, the order specified also represents priority from left (low) to
right (high).

## Short-Hand

### Property Short-Hand

A syntax exists that allows schema authors to quickly specify nested properties.
Each dot (".") that occurs in a key is treated as an indication of nesting and is 
expand prior to program output.

Example:

```json
{

  "path.to.child": "here"

}

```
is the same as:

```json

{

 "path": {

   "to": {

     "child": "here"

   }

 }

}

```

### Schema Short-hand

To reduce the level of nesting common with JSON documents, this specification
provides for describing the type of a schema via a string in certain places.

Example:

```json

{

 "type": "object",
 "properties": {
 
      "id": "number",
      "name": "#name"
  }

}

```

During processing the processing program will expand the above as follows:

```json
{

  "type": "object",
  "properties": {

    "id": {

       "type": "string"

     },
     "name": {

        "type": "#name"

     }

  }

}

```

This expansion only takes place in the following conditions:
1. When a property of the `properties` section of an object type is a string.
2. When the `additionalProperties` section of an object type is a string.
3. When the `items` property of an array type is a string.
4. When a property of the `variants` section of a sum type is a string.
5. When a property of the `definitions` section of the root schema is a string.

## Fragments

To allow for easier file management, fragments of JSON contained in other
files may be merged into a Data Document Schema via a `$ref` property.

The value of a `$ref` property must be a string that is a path to a valid JSON 
file or an array of strings where each string is a path to a valid JSON file.

### Paths

Paths may be relative or absolute. If the path is relative then it is resolved
relative to the file location of the schema document.

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

## User properties

A Data Document Schema may contain any number of extra properties the document
author desires.

## Compilation

A processing program compiles a Data Document Schema into a template context.
This takes place through the following stages:

1. Path Expansion
2. Namespace Substitution
3. Fragment Resolution
4. Schema Expansion
5. Definition Registration
6. Definition Merging

### Path Expansion

During this stage, nested property short hand is expanded to full JSON object
representation.

### Namespace Substitution

During this stage the processing program calculates the effective namespace(s)
and replaces namespaced properties with the relevant want ones. 

### Fragment Resolution

During this stage `$ref` properties are recursively resolved and merged into the owning property.

### Schema Expansion

During this stage, short-hand such as `"type": "string"` are expanded 
to full JSON objects. For example the former would become `{ "type": "string" }`.

### Definition Registration

During this stage, the processing program validates the `definitions` property and registers each definition it finds under their respective names.
the `definitions` property.

### Definition Merging

At this stage all usage of defined types are resolved.

Resolution takes place by merging the resolved schema of a defined type
with the existing JSON object.

After all these steps have been applied, the processing program should
use the resulting JSON object to generate output.

## Checks Extension

The Data Document Schema specification also describes a framework for validating
the integrity of JSON documents called the Checks Extension.

The Checks Extension allows schema authors to specify a pipeline of 
preconditions for the schema and any of its properties.

### Specifying Checks

Checks are specified by the `@@checks` property. If this property 
exists, its value must be an array where each member is either a string
or an array.

If a member is a string, it represents a function that accepts no arguments.
If the member is an array, the first element must be a string representing
the name of the function and the other elements arguments to be passed 
to the function.

### Check Implementation

The method required for implementing checks is left entirely up to the
processing program.

### Type Checks

A processing program that supports the checks extension must also support
type checking. That is, the following base types must be validated
at runtime:

1. object
2. array
3. sum
4. string
5. number
6. boolean

For 1, the processing program must ensure a test for a value being
an object exists (an array is not an object) and must validate the `properties` and `additionalProperties`
of that object.

For 2, the processing program must ensure a test for a value being an array
exists and that it conforms to the `items` property schema.

For 3, the processing program must ensure a test exists for discriminating 
a value based on the variants of a sum. Each variant's schema should be
tested against the value until one succeeds.

For 4-6, the processing program preforms the runtime equivalent of a
"typeof <type>" test.  