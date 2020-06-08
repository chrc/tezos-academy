# Chapter 11 : Lists and Sets

<dialog character="pilot">Please now plot our course as a list of destinations.</dialog>

Lists are linear collections of elements of the same type. Linear means that, in order to reach an element in a list, we must visit all the elements before (sequential access). Elements can be repeated, as only their order in the collection matters. The first element is called the head, and the sub-list after the head is called the tail.

## Lists

To define an empty list :

```
let empty_list : list (int) = [];
```

To define list with values:

```
let my_list : list (int) = [1, 2, 2]; // The head is 1
```

Lists can be augmented by adding an element before the head (or, in terms of stack, by pushing an element on top). This operation is usually called consing in functional languages.

In ReasonLIGO, the cons operator is infix and noted _, ..._. It is not symmetric: on the left lies the element to cons, and, on the right, a list on which to cons :

```
let larger_list : list (int) = [5, ...my_list]; // [5,1,2,2]
```

## Functional Iteration over Lists

A functional iterator is a function that traverses a data structure and calls in turn a given function over the elements of that structure to compute some value. There are three kinds of functional iterations over LIGO lists: the *iterated operation*, the *map operation* (not to be confused with the map data structure) and the *fold operation*.

### Iterated Operation over Lists

The first, the iterated operation, is an iteration over the list with a unit return value. It is useful to enforce certain invariants on the element of a list, or fail.
For example you might want to check that each value inside of a list is within a certain range, and fail otherwise. The predefined functional iterator implementing the iterated operation over lists is called _List.iter_.

```
let iter_op = (l : list (int)) : unit => {
  let predicate = (i : int) => assert (i > 3);
  List.iter (predicate, l);
};
```

### Mapped Operation over Lists

We may want to change all the elements of a given list by applying to them a function. This is called a *map operation*, not to be confused with the map data structure. The predefined functional iterator implementing the mapped operation over lists is called _List.map_ and is used as follows.

```
let increment = (i : int) : int => i + 1;

// Creates a new list with all elements incremented by 1
let plus_one : list (int) = List.map (increment, larger_list);
```

### Folded Operation over Lists

A *folded operation* is the most general of iterations. The folded function takes two arguments: an accumulator and the structure element at hand, with which it then produces a new accumulator. This enables having a partial result that becomes complete when the traversal of the data structure is over. The predefined functional iterator implementing the folded operation over lists is called _List.fold_ and is used as follows.

```
let sum = ((result, i): (int, int)): int => result + i;
let sum_of_elements : int = List.fold (sum, my_list, 0);
```

## Sets

Sets are unordered collections of values of the same type, like lists are ordered collections. Elements of sets in LIGO are unique, whereas they can be repeated in a list. 

### Defining sets

In ReasonLIGO, the empty set is denoted by the predefined value _Set.empty_.

```
let my_set : set (int) = Set.empty;
```

In ReasonLIGO, there is no predefined syntactic construct for sets: you must build your set by adding to the empty set. (This is the way in OCaml.)

```
let my_set : set (int) =
  Set.add (3, Set.add (2, Set.add (2, Set.add (1, Set.empty : set (int)))));
```

### Test membership in sets

In ReasonLIGO, the predefined predicate _Set.mem_ tests for membership in a set as follows:

```
let contains_3 : bool = Set.mem (3, my_set);
```

### Cardinality of sets

The predefined function _Set.size_ returns the number of elements in a given set as follows :

```
let cardinal : nat = Set.size (my_set);
```

### Updating sets

In ReasonLIGO, we can use the predefined functions Set.add and Set.remove. We update a given set by creating another one, with or without some elements.

```
let larger_set  : set (int) = Set.add (4, my_set);
let smaller_set : set (int) = Set.remove (3, my_set);
```

### Functional Iteration over Sets

It is possible to iterate over elements of a set and apply a function to them (like functional iteratio over List).

There are three kinds of functional iterations over LIGO sets: the *iterated operation* and the *folded operation*.

#### Iterated Operation

```
let iter_op = (s : set (int)) : unit => {
  let predicate = (i : int) => assert (i > 3);
  Set.iter (predicate, s);
};
```

#### Folded Operation

```
let sum = ((acc, i) : (int, int)) : int => acc + i;
let sum_of_elements : int = Set.fold (sum, my_set, 0);
```

## Your mission

<!-- prettier-ignore -->1- Define _itinary_ as a list of string names of celestial bodies representing your course. Start with _"earth"_

<!-- prettier-ignore -->2- On the next line, add _"sun"_ to the *itinary* and save it into a *longer\_itinary* constant.

<!-- prettier-ignore -->2- On the next line, add _"alpha-centauri"_ to the *longer\_itinary* and save it into a *far\_itinary* constant.