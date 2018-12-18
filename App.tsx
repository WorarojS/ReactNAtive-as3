import React from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  Text, 
  View, 
  TextInput,
  Button,
  FlatList, 
  TouchableOpacity
} from 'react-native';
import { SecureStore, SQLite, FileSystem } from 'expo'

const db = SQLite.openDatabase('todo.db')

// save - delete & insert
// get = start

interface IState {
  todoText: string
  items: string[]
}

export default class App extends React.Component <{}, IState>{
  state = {
    todoText: '',
    items: []
  }

  async componentWillMount() {
    try {
      // get items from SecureStore
      // const list = await SecureStore.getItemAsync('list')

      // if (list !== null && list !== undefined) {
      //   this.setState({ items: JSON.parse(list) })
      // }

      // get items from SQLite
      db.transaction((tx: any) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS items (todo_text text);')
        tx.executeSql(
          'SELECT todo_text FROM items', [],
          ( _, { rows: { _array } }) => this.setState({ 
            items: [...this.state.items, ..._array.map(
              (todoObj) => todoObj.todo_text
            )] 
          })
        )
      })

    } catch (error) {
      // error handling
    }
  }

  _insert = async () => {
    // insert item
    // Have to pass an array, instead of only a new item
    const { items, todoText } = this.state
    try {
      await this.setState({ 
        todoText: '',
        items: [...items, todoText] 
      })
      await db.transaction((tx: any) => {
        console.log('_insert is called!!!!')
        tx.executeSql(
          'INSERT INTO items (todo_text) VALUES (?)',
          [todoText]
        )
      })
      // await SecureStore.setItemAsync('list', JSON.stringify(this.state.items))
    } catch (error) {
      // error handling
    }
  }

  _delete = async (todoText: string) => {
    const { items } = this.state
    // delete
    const index = (items as string[]).indexOf(todoText)
    items.splice(index, 1)
    try {
      await this.setState({ items: [...items] })
      
      await db.transaction((tx: any) => {
        console.log("todoText: " + todoText)
        tx.executeSql(
          'DELETE FROM items WHERE todo_text = ?',
          [todoText]
        )
      })
      // await SecureStore.setItemAsync('list', JSON.stringify(this.state.items))
    } catch (error) {
      // error handling
    }
  }

  /* pass a func 

    // pass a func that calls _delete(item)
    onPress={() => this._delete(item)}

    // pass a func directly
    onPress={this._insert}
  */

  _listItemRenderer = (item: string) => {
    const { listItemStyle, listItemTextStyle } = styles
    return (
      <TouchableOpacity onPress={() => this._delete(item)}>
        <View style={listItemStyle}>
          <Text style={listItemTextStyle}>{item}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    // {} implies destructuring
    const { container, todoTextStyle, listStyle } = styles
    const { items, todoText } = this.state
    return (
      <SafeAreaView style={container}>
        <TextInput
          style={todoTextStyle}
          value={todoText}
          onChangeText={(todo) => this.setState({ todoText: todo })}
        />

        {/* 
        data = dataSource 
        renderItem = cell
        */}

        <FlatList
          style={listStyle}
          data={items}
          renderItem={({item}) => this._listItemRenderer(item)}
          keyExtractor={(item, index) => index.toString()}
        />

        <Text>{FileSystem.documentDirectory}</Text>

        <Button
          title={'Add Todo'}
          onPress={this._insert}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoTextStyle: {
    width: '90%',
    marginTop: 16,
    marginBottom: 16,
    borderBottomWidth: 2,
    fontSize: 18,
    justifyContent: 'center'
  },
  listStyle: {
    width: '100%',
    flex: 1
  },
  listItemStyle: {
    backgroundColor: '#4286f4',
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  listItemTextStyle: {
    color: 'white',
    fontSize: 20
  }
});
