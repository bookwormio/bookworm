import { View, StyleSheet, TextInput, ActivityIndicator, Button, Text } from 'react-native'
import React, { useState } from 'react'
import { FIREBASE_AUTH } from '../firebase.config'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [successfulUser, setMessage] = useState('')
    const auth = FIREBASE_AUTH;
    
    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            setMessage("Successful sign in");
        }
        catch (error) {
            console.log(error);
            setMessage("sign in error");
        }
        finally {
            setLoading(false);
        }
    }

    const signUp = async () => {
        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            setMessage("Successful sign up");
        }
        catch (error) {
            console.log(error);
            setMessage("sign up error");
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} value={email} placeholder='Email' autoCapitalize='none' onChangeText={(text) => setEmail(text)}></TextInput>
            <TextInput style={styles.input} value={password} secureTextEntry={true} placeholder='password' autoCapitalize='none' onChangeText={(text) => setPassword(text)}></TextInput>

            { loading ? <ActivityIndicator size="large" color="#0000ff" />
            : <>
                <Button title="Login" onPress={signIn}/> 
                <Button title="Create Account" onPress={signUp}/>
            </> }
            <Text>{successfulUser}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      padding: 40,
    },
    main: {
      flex: 1,
      justifyContent: "center",
      maxWidth: 960,
      marginHorizontal: "auto",
    },
    input: {
        borderColor: "gray",
        width: "100%",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
      },
    title: {
      fontSize: 64,
      fontWeight: "bold",
    },
    subtitle: {
      fontSize: 36,
      color: "#38434D",
    },
  });

export default Login