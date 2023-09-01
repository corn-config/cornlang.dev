---
layout: ../layouts/Markdown.astro
title: Full specification
---

# Corn specification

- Corn is case-sensitive unless specified otherwise. 
- The configuration must be valid UTF-8.
- In unsupported scenarios, this produces a parser error.

## File structure

Each file contains a single top-level [object](#object). 
Other top-level value types are not supported. 
Multiple top-level objects are not supported.

Valid: 

```corn
{ }
```

Invalid:

```corn
[ ] 
```

Optionally, the top-level object may be preceded by a [let block](#let-block).

## Key/value pairs

[Objects](#object) are made of zero or more pairs of keys and values, 
written in the format `key = <value>`, where value is a valid [value](#types).

Keys do not require quotes around them. They can consist of any UTF-8 characters, excluding:

- [Whitespace](#whitespace)
- `.` full stop (period)
- `=` equals

```corn
{
  // all of the following are valid:
  with_underscore = 0
  with-dash = 1
  with_🌽 = 2
  !"£$%^&*()_ = 3
  j12345 = 4
}
```

If duplicate keys exist, the last one (that is, the one defined furthest down the object) should be taken.

## Types

A value can be one of several types, or an [input](#inputs).

Each type is detailed below.

### String

Strings are denoted using double-quotes `"` either side of the value. 
They contain valid UTF-8 only.

Line breaks inside a string value are not supported.

```corn
{ foo = "hello world" }
```

The following standard escape characters are supported:

- `\\` backslash
- `\"` double-quote
- `\n` newline
- `\r` carriage return
- `\t` tab

```corn
{ foo = "hello\nworld" }
```

You can also include any Unicode character using an `\uXXXX` escape code. 
`XXXX` must be replaced with exactly 4 hexadecimal digits.

```corn
{ foo = "\u2603" }
```

### Integer

Integers are signed 64-bit values.

Negative values can be represented with a `-`.
Using a `+` for positive values is not supported.

Long numbers can be broken up by placing a single underscore `_` between digits.
Underscores cannot be the first or last characters in a value.

```corn
{
  foo = 42
  tiny = -3000
  very_big = 1_000_000_000
}
```

### Float

Floats are double-precision (64-bit).

Negative values can be represented with a `-`. 
Using a `+` for positive values is not supported.

A decimal point must be present, otherwise the number should be handled as an [integer](#integer).
At least one digit must precede the decimal point `.`.

Very large or small values can be represented as exponents 
by suffixing the value with `e+N` or `e-N`, 
where `e+` and `e-` are literal and `N` is an integer.
The `e` is case-insensitive.

```corn
{
  // valid
  pi = 3.14159
  negative_pi = -3.14159
    
  // valid exponents
  very_big = 1.01e+10
  very_small = 1.01e-10
  
  // invalid
  pi = +3.14
  very_big = e+10
} 
```

### Boolean

Booleans can be one of either `true` or `false`.

```corn
{ 
  foo = true 
  bar = false 
}
```

### Object

Objects are a set of [key/value pairs](#keyvalue-pairs) or [input merges](#object-merging), denoted with braces `{ }` at the start and end.

There is no restriction on which value types can be placed inside an object.
There is no restriction on nesting depth.

Objects can be any size, and empty objects are valid.

It is recommended that implementations ensure keys are outputted in a consistent order,
even if this is not input order, but this is not required. No guarantee about key order is made.

```corn
{
  foo = { bar = 42 }
}
```

### Array

Arrays are a collection of values or [input merges](#array-merging), denoted with square brackets `[ ]` at the start and end.
Values inside the array are separated only by [whitespace rules](#whitespace), 
and in several cases require no separation (not even whitespace) between values.

There is no restriction on which value types can be placed inside an array.
Mixed values types are supported.

Arrays can be any length, and empty arrays are valid.

Value order is preserved.

```corn
{
  foo = [ 1 2 3 ]
  bar = [ "mixed" 3.14 false { baz = null } ]
}
```

### Null

The absence of any value can be represented with the null type.

This is represented with the `null` keyword.

```corn
{ foo = null }
```

## Inputs

In place of value literals, declared constant value 'inputs' can be used. These are declared inside a [let block](#let-block).

Input names always start with a dollar `$` when declaring and referencing them. 
The first character after the dollar must be either alphabetic (`a-z` `A-Z`) or an underscore `_`.
This can be followed by any number of alphanumeric (`a-z` `A-Z` `0-9`) characters or underscores.

Valid:

```corn
let { $foo = "bar" } in {}
```

Invalid:

```corn
let { $123 = "bar" } in {}
```

The values associated with inputs can be of any type. 
Referencing undeclared inputs is unsupported, unless they are valid [environment inputs](#environment-inputs).

Inputs are valid in any place a value is valid.

Inputs can reference other inputs, so long as the referenced inputs are declared first (further up the declaration block).

```corn
let {
    $firstName = "John"
    $lastName = "Smith"
    $name = { first = $firstName last = $lastName }
} in {}
```

### Let block

All inputs must be declared inside a let block which precedes the top-level object. This is defined using `let { } in`, 
where input declarations are included between the braces `{ }`.

Input declarations are written in a similar format to key/value paris, in the style of `$input = <value>`, 
where `<value>` is a valid [value](#types).

```corn
let { 
  $value = 42
} in {
  foo = $value
}
```

Empty let blocks are valid:

```corn
let { } in { }
```

### Environment inputs

Any environment variable can be used as an input. 
These do not need to be explicitly declared in a [let block](#let-block).

To reference environment inputs, use the special `env_` prefix in input names. 
This prefix is omitted when reading environment variables.

For example, to reference the `PATH` environment variable, use `$env_PATH`:

```corn
{ path = $env_PATH }
```

Explicitly declaring environment inputs is allowed. 
Environment variables take precedence over explicit declarations.

```corn
let {
  // will be used if `FOO` is not set.
  $env_FOO = 42
} in { 
  foo = $env_FOO
}
```

If the environment variable is not set and no explicit declaration is present,
this is handled as an undeclared input.

### String interpolation

Inputs with values of type [string](#object) can be interpolated inside string values.

The input is referenced in the standard manner within the double quotes `""`, and standard input reference rules apply.

```corn
let {
  $subject = "world"
} in {
  // evaluates as "hello, world"
  greeting = "hello, $subject"
}
```

To escape an input reference (instead writing the literal dollar prefixed string), 
the dollar should be prefixed with a backslash `\`.

```corn
{
  // evaluates as "hello, $subject"
  greeting = "hello, \$subject"
}
```

Non-string input types are not supported.

### Object merging

Inputs with values of type [object](#object) can be merged into object values 
using the merge operator `..` before an input reference. 

Object merging takes each [key/value pair](#keyvalue-pairs) in the input value and inserts them into the current object.

```corn
let {
  $start = { one_fish = "two fish" }
} in {
  // evaluates as { one_fish = "two fish" red_fish = "blue fish" }
  dr_seuss = { 
    ..$start
    red_fish = "blue fish"
  } 
}
```

Object spreading can be used anywhere within the key/value set and does not need to be at the start or end.

Spreads are evaluated in the order they are written. 
Key/value pairs or spreads will overwrite keys already present in the object, regardless of whether they were introduced by spreading.

Non-object input types are not supported.

### Array merging

Inputs with values of type [array](#array) can be merged into array values using the merge operator `..` before an input reference.

Array merging takes each value in the input array and inserts them at that position in the current object. 
Input element ordering is preserved.

```corn
let {
  $start = [ 1 2 3 4 ]
} in {
  // evaluates as [ 1 2 3 4 5 6 7 8 ]
  foo = [ ..$start 5 6 7 8 ] 
}
```

Array spreading can be used anywhere within an array and does not need to be at the start or end.

Non-array input types are not supported.

## Key chaining

Corn supports a feature called 'key chaining', 
which allows keys to be set on deeply nested objects in a single assignment.

For example, the following two examples are equivalent:

```corn
{
  // without key chaining
  foo = {
    bar = 42
  }
  
  // with key chaining
  foo.bar = 42
}
```

The 'standard' nested object syntax can be mixed with key chaining:

```corn
{
  foo = {
    bar = 42
  }
  
  foo.pi = 3.14
}
```

If no value exists at any key in a chain, an object is automatically created.
The value associated with each key must therefore either be undefined or an object - key-chaining through non-object types is not allowed.

```corn
{
  foo = 42
  // invalid, `foo` is not an object
  foo.pi = 3.14 
}
```

There is no restriction on the depth at which keys can be chained.
There is no restriction on the depth at which key chaining can start.

## Comments

Comments can be included using two forward slashes `//`.
A comment terminates at the first `\n` character (or `EOF`).

Comments are entirely ignored by the parser.

Mixed-line comments and standalone comments are supported.
Block comments are not.

```corn
{
  // this is a single-line comment
  foo = bar // this is a mixed-line comment
}
```

## Whitespace

The following characters are valid whitespace: 

- Literal space ` `
- Tab `\t`
- Newline `\n`
- Carriage return `\r`

Any quantity or combination of the above characters is permitted, so long as it abides by the rules described below.

Whitespace is almost entirely optional. It is required in the following places only:

- When an integer or float follows another integer or float, whitespace must be included between them:
    ```corn
    { 
      // valid, interpreted as an integer followed by a float
      foo = [ 1 2.3 ] 
  
      // valid, but incorrectly interpreted as a single float
      foo = [ 12.3 ] 
    }
    ```
- When referencing inputs, whitespace must be included after the input name.
  ```corn
  {
    // valid, interpreted as two inputs
    foo = [ $a $b ]
  
    // invalid, interpreted as a single input
    foo = [ $a$b]
  }
  ```
- When a value is followed by a key, whitespace must be included between them.
  ```corn
  {
    // valid, value is separate from next key
    foo = 4 bar = 5
  
    // invalid, value is not separate from next key
    foo = 4bar = 4
  }
  ```

Whitespace cannot exist inside key or value tokens, unless part of whitespace inside a string literal:

```corn
{
  // invalid, keys cannot contain spaces
  foo bar = 4  

  // invalid, values cannot contain spaces
  pi = 3 .14

  // valid, strings can contains spaces
  foo = "hello world"
}
```

Based on these rules, Corn supports a very compact syntax. The following is entirely valid:

```corn
{
  one={foo="bar" bar="foo"}
  two={foo=1 bar=2}
  three={foo=1.0 bar=2.0}
  four={foo=true bar=false}
  five={foo=null bar=null}
  six={foo={} bar={}}
  seven={foo=[] bar=[]}

  eight=["foo""bar"]
  nine=[truefalse]
  ten=[nullnull]
  eleven=[[][]]
  twelve=[{}{}]
}
```

And since newlines and indentation are optional too, this can be condensed further into:

```corn
{one={foo="bar" bar="foo"} two={foo=1 bar=2} three={foo=1.0 bar=2.0} four={foo=true bar=false} five={foo=null bar=null} six={foo={} bar={}} seven={foo=[] bar=[]} eight=["foo""bar"] nine=[truefalse] ten=[nullnull] eleven=[[][]] twelve=[{}{}]}
```

Writing Corn in the style of the above two examples is not recommended.

## File extension

Corn files should use the `.corn` file extension.

## Mime type

Corn files should use the `application/corn` MIME type.

## Grammar

A formal language grammar can be found in the repo [here](https://github.com/JakeStanger/corn/blob/master/libcorn/src/grammar.pest).

The Rust parser code is automatically generated from this.