
# Dagen

Generate boilerplate output from a schema.

Dagen (DATA GENerator) is a tool for generating code for an application's
data models using templates.

It works by pre-processing a JSON document in a 
[JSON Schema](http://json-schema.org) simillar syntax then executing a user
supplied template against the processed document.

Templates are generated using [Nunjucks](https://github.com/mozilla/nunjucks).

See the `spec.md` file for the specifics of the schema syntax.


## Installation

```sh
  npm install -g @quenk/dagen
```

## Usage

``` sh
Usage:             
   main.js [--namespace=NAMESPACE...] [--plugin=PATH...] [--definitions=PATH...]
          [--set=KVP...] [--template=TEMPLATE] [--templates=PATH]              
          [--check=PATH...] [--install-check=PATH] <file>                      

Options:           
  -h --help                  Show this screen.                                 
  --template TEMPLATE        Specify the template to use when generating code. 
  --templates PATH           Path to resolve templates from. Defaults to process.cwd().
  --namespace EXT            Sets a namespace to be in effect.                 
  --plugin PATH              Path to a plugin that will be loaded at runtime.  
  --definitions PATH         Path to an exported definition object to include. 
  --set PATH=VALUE           Set a value on the schema document.                      
  --check PATH               Loads and applies a check to the final document. 
  --install-check PATH       Make a precondition available to be used as a $check.
  --version                  Show version. 
```

## License

Apache-2.0 (C) Quenk Technologies Limited.
