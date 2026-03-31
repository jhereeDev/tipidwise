import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useResponsive } from '../hooks/useResponsive';
import { supabase } from '../lib/supabase/client';

export default function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { hp, contentWidth, safeEdges, landscapeHp } = useResponsive();
  const { isSignedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isSignedIn) return <Redirect href="/(tabs)/dashboard" />;

  const handleSignIn = async () => {
    if (!email.trim()) {
      toast.warning('Email required', 'Please enter your email address.');
      return;
    }
    if (!password) {
      toast.warning('Password required', 'Please enter your password.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('wrong password')) {
        toast.error('Invalid credentials', 'Email or password is incorrect. Please try again.');
      } else if (msg.includes('email not confirmed')) {
        toast.warning('Email not confirmed', 'Please check your inbox and confirm your email first.');
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        toast.warning('Too many attempts', 'Please wait a moment before trying again.');
      } else {
        toast.error('Sign in failed', error.message);
      }
      return;
    }

    toast.success('Welcome back!', 'You are now signed in.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={[...safeEdges, 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: hp + landscapeHp, paddingTop: theme.spacing.md }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[theme.typography.bodyLg, { color: theme.colors.primary[500] }]}>← Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={{ maxWidth: contentWidth, width: '100%', alignSelf: 'center', paddingHorizontal: hp + landscapeHp }}>
            <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
              <Text style={[theme.typography.displaySm, { color: theme.colors.textPrimary, marginBottom: theme.spacing.xs }]}>Welcome back</Text>
              <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary }]}>Sign in with your email and password</Text>
            </View>

            <View style={{ gap: theme.spacing.md, maxWidth: 400, width: '100%', alignSelf: 'center' }}>
              <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" leftIcon="📧" />
              <Input label="Password" placeholder="Your password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" leftIcon="🔒" />
              <Button label="Sign In" onPress={handleSignIn} loading={loading} fullWidth size="lg" />

              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xs, marginTop: theme.spacing.md }}>
                <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary }]}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.replace('/sign-up' as any)}>
                  <Text style={[theme.typography.labelLg, { color: theme.colors.primary[500] }]}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
