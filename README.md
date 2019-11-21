# API Resource Collection

This package is designed to replace async actions and related reducers in a REST based API React/Redux application, however, there are no dependencies on React or Redux, so in theory it could be used outside this suggested use case.

## Description

Having written a few React & Redux projects, I was curious to see if I could simplify the API communication aspect. Traditionally, an async action for each request for resource would be written, and a reducer would handle the data that was retrieved form the API.

Typically, API communication follows this path: a request is made, then either a successful or failed response will come back. If all API communication can be treated the same, it could enable some automation - that's where this package can help.

## Installation

`$ npm i api-resource-collection`

## Usage

### 1. Set Up Resources File

The first thing you'll need is a module to export your resource collections from. This can then be imported anywhere else in your project that you need to access them. You may wish to call your file something like `apiCollections.js`.

#### Imports

At the top of this file make your imports from the package. You'll need `apiResourceCollection` as a minimum and ordinarily `getResource`. `ActionName` is also useful for setting up resources.

`import { apiResourceCollection, getResource, ActionName } from 'api-resource-collection';`

#### Create Collection:

Next you need to set up and export your collection. Say for example you want to perform CRUD operations on a 'users' reosurce, you set up your `users` collection like this:

`export const usersCollection = apiResourceCollection('users');`

`apiResourceCollection` also accepts an optional `options` argument which you can use to store a token for your API communication and values you intend to use in your endpoints, like perhaps userId. That setup could look like this:

```
const options = {
  token: 'your_token_string',
  userId: 1
};
export const usersCollection = apiResourceCollection('users', options);
```

#### Resources

After setting up the collection, add the 'resources'. these consist of the sort of request you want to make and the endpoint you want to use. Let's say you want to use an endpoint to get all users - you set up a resource as follows:

`const resource = getResource(ActionName.GET_ITEMS, 'https://api.example.com/users')`

#### Action Names

There are a few types of operation set up and represented within the `ActionName` enum. They are associated by default with the appropriate HTTP verb as follows:

1. Get a list: `ActionName.GET_ITEMS` (GET request)
2. Get an item: `ActionName.GET_ITEM` (GET request)
3. Create an item: `ActionName.CREATE_ITEM` (POST request)
4. Update an item: `ActionName.UPDATE_ITEM` (PUT request)
5. Modify an item: `ActionName.MODIFY_ITEM` (PATCH request)
6. Delete an item: `ActionName.DELETE_ITEM` (DELETE request)

#### Bespoke Actions

These should cover most traditional REST API requests, but if you need to modify these, or add a bespoke one, this is possible by using the `options` argument, as follows:

```
const options = {
  method: HTTPMethod.POST,
  dataName: 'registeredUser'
};
`const resource = getResource('registerNewUser', 'https://api.example.com/users', options)`
```

(N.B. to use HTTPMethod, import it at the top)

After creating the resource you want to use, add to the collection like this:

`usersCollection.addResource(resource);`

#### Dynamic Endpoints

If you need to perform a request on a particular item, and/or by a particular user, you need to use dynamic properties in the endpoint. These placeholder strings denoted with a colon `:prop` can be swapped out for thevalue you wish to use. E.g.:

For example, if you wish to fetch a particular user, your endpoint might look like this:

`https://api.example.com/users/:userId`

the `:userId` would be swapped out for a value of the same name when making the API Rrquest.

#### Example File

This is how an example file containing a 'notes' resource collectionmight look:

```
import { apiResourceCollection, getResource, ActionName } from 'api-resource-collection';

const baseURL = `${process.env.REACT_APP_API_URL}/api`;

const options = {
  token: process.env.REACT_APP_TOKEN
};
export const notesCollection = apiResourceCollection('notes', options);

notesCollection.addResource(getResource(ActionName.GET_ITEMS, baseURL + '/users/:userId/notes'));
notesCollection.addResource(getResource(ActionName.CREATE_ITEM, baseURL + '/notes'));
notesCollection.addResource(getResource(ActionName.UPDATE_ITEM, baseURL + '/notes/:noteId'));
notesCollection.addResource(getResource(ActionName.MODIFY_ITEM, baseURL + '/notes/:noteId'));
notesCollection.addResource(getResource(ActionName.DELETE_ITEM, baseURL + '/notes/:noteId'));
```

### 2. Add Reducers to Store

Get the reducers from the collection and add to the store:

```
const reducers = notesCollection.getReducers()
const appReducer = combineReducers(reducers);
```

### 3. Making API Requests

First import the collection you created earlier:

`import { usersCollection } from './../path/to/apiCollections';`

#### Getting a list of items:

You can then get the action that you want to dispatch using the collection. For example, if you want to get a list of users:

`const action = usersCollection.getItems()`

And then dispatch it:

`dispatch(action)`

Or all on 1 line:

`dispatch(usersCollection.getItems())`

#### Creating a Resource

When creating a new resource, you will want to send a body data object, which represents the user data that you want to send to the API endpoint:

```
const body = {
  name: 'John',
  surname: 'Doe',
  email: 'john.doe@domain.com'
}
const action = usersCollection.createItem(body)
```

#### Updating a Resource

When making an update, you'll probably need to target a specific resource item, typically by using the id in the endpoint. For example to update the name of the user with id `768`, you might need to `PUT` to endpoint `https://api.com/users/:userId`, with an added `values` object which contains any properties you want to swap in the endpoint:

```
const body = {
  name: 'Jonny',
  surname: 'Doe',
  email: 'jonny.doe@domain.com'
}
const action = usersCollection.updateItem(body, { userId:768 });
```

#### Headers:

If you need to add any headers to a particular request, you do with a headers object argumaent as follows:

```
const body = {
  name: 'Jonny',
  surname: 'Doe',
  email: 'jonny.doe@domain.com'
}
const headers = {
  headerName: 'Header Name'
}
const action = usersCollection.updateItem(body, { userId:768 }, headers);
```

#### Handling Errors:

Error handling is built in and dispatching an action will return a response object, so you can handle error checking as follows:

```
let response = await dispatch(usersCollection.updateItem(body, { userId:768 }));
if (response.ok) {
  // the request was successful
} else {
  // the request failed
}
```

### 4. Using State From Redux:

First import the collection you created earlier:

`import { usersCollection } from './../path/to/apiCollections';`

In a component, you'll want to access the state so you can display the data on the screen. Use the hook as follows:

`const users = useSelector(usersCollection.useCollection);`

In the example earlier, this would return the following (API resource) properties:

```
items
item
updateditem
modifiedItem
createdItem
deletedItem
```

and `selectedItem` (not API based). Each of the API resource properites has the following structure:

```
data
isLoading
isLoaded
isError
error
loadingState
```
