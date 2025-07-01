struct AddressArray {
    // An array of Int values as a map of Ints to Ints,
    // with serialization of its keys to uint16 to save space
    m: map<Int as uint16, Address>;

    // Length of the array, defaults to 0
    length: Int = 0;
}

// Compile-time constant upper bound for our map representing an array.
const MaxArraySize: Int = 5_000; // 5,000 entries max, to stay reasonably far from limits

// Extension mutation function for adding new entries to the end of the array
extends mutates fun append(self: AddressArray, item: Address): AddressArray {
    require(self.length + 1 <= MaxArraySize, "No space in the array left for new items!");

    self.m.set(self.length, item); // set the entry (key-value pair)
    self.length += 1; // increase the length field
    return self;
}

// Extension mutation function for inserting new entries at the given index
extends mutates fun insert(self: AddressArray, item: Address, idx: Int): AddressArray {
    require(self.length + 1 <= MaxArraySize, "No space in the array left for new items!");
    require(idx >= 0, "Index of the item cannot be negative!");
    require(idx < self.length, "Index is out of array bounds!");

    // Move all items from idx to the right
    let i: Int = self.length; // not a typo, as we need to start from the non-existing place
    while (i > idx) {
        // Note that we use the !! operator, as we know for sure the value would be there
        self.m.set(i, self.m.get(i - 1)!!);
        i -= 1;
    }

    // Insert the new item
    self.m.set(idx, item); // set the entry (key-value pair)
    self.length += 1; // increase the length field

    return self;
}

// Extension function for getting the value at the given index
extends fun getIdx(self: AddressArray, idx: Int): Address {
    require(self.length > 0, "No items in the array!");
    require(idx >= 0, "Index of the item cannot be negative!");
    require(idx < self.length, "Index is out of array bounds!");

    // Note that we use the !! operator, as we know for sure the value would be there
    return self.m.get(idx)!!;
}

// Extension function for returning the last value
extends fun getLast(self: AddressArray): Address {
    require(self.length > 0, "No items in the array!");

    // Note that we use the !! operator, as we know for sure the value would be there
    return self.m.get(self.length - 1)!!;
}

// Extension mutation function for deleting an entry at the given index and returning its value
extends mutates fun deleteIdx(self: AddressArray, idx: Int): Address {
    require(self.length > 0, "No items in the array to delete!");
    require(idx >= 0, "Index of the item cannot be negative!");
    require(idx < self.length, "Index is out of array bounds!");

    // Remember the value that is going to be deleted
    let memorized: Address = self.m.get(idx)!!;

    // Move all items from idx onwards to the left
    let i: Int = idx;
    while (i + 1 < self.length) {
        // Note that we use the !! operator, as we know for sure the value would be there
        self.m.set(i, self.m.get(i + 1)!!);
        i += 1;
    }

    self.m.set(self.length - 1, null); // delete the last entry
    self.length -= 1; // decrease the length field

    return memorized;
}

// Extension mutation function for deleting the last entry and returning its value
extends fun deleteLast(self: AddressArray): AddressArray {
    require(self.length > 0, "No items in the array!");

    // Note that we use the !! operator, as we know for sure the value would be there
    let lastItem: Address = self.m.get(self.length - 1)!!;
    self.m.set(self.length - 1, null); // delete the entry
    self.length -= 1; // decrease the length field

    return self;
}

// Extension function for deleting all items in the Array
extends mutates fun deleteAll(self: AddressArray) {
    self.m = emptyMap();
    self.length = 0;
}

// Global static function for creating an empty Array
fun emptyArray(): AddressArray {
    return AddressArray { m: emptyMap(), length: 0 }; // length defaults to 0
}