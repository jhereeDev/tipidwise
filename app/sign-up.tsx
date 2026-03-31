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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { hp, contentWidth, safeEdges, landscapeHp } = useResponsive();
  const { isSignedIn } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isSignedIn) return <Redirect href="/(tabs)/dashboard" />;

  const handleSignUp = async () => {
    // Validation
    if (!displayName.trim()) {
      toast.warning('Name required', 'Please enter your display name.');
      return;
    }
    if (!email.trim()) {
      toast.warning('Email required', 'Please enter your email address.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      toast.error('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      toast.warning('Password required', 'Please enter a password.');
      return;
    }
    if (password.length < 6) {
      toast.error('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords don\'t match', 'Please make sure both passwords are the same.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    setLoading(false);

    if (error) {
      // Handle specific error cases
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('duplicate') || msg.includes('already exists')) {
        toast.error('Email already registered', 'An account with this email already exists. Try signing in instead.');
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        toast.warning('Too many attempts', 'Please wait a moment before trying again.');
      } else if (msg.includes('password')) {
        toast.error('Password issue', error.message);
      } else {
        toast.error('Sign up failed', error.message);
      }
      return;
    }

    // Supabase may return a user even for duplicate emails (with email confirmation disabled)
    // Check if the user identities are empty — this means the email is already taken
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast.error('Email already registered', 'An account with this email already exists. Try signing in instead.');
      return;
    }

    toast.success('Account created!', 'You can now sign in with your credentials.');
    setTimeout(() => router.replace('/sign-in' as any), 1500);
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
              <Text style={[theme.typography.displaySm, { color: theme.colors.textPrimary, marginBottom: theme.spacing.xs }]}>Create account</Text>
              <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary }]}>Start tracking smarter with TipidWise</Text>
            </View>

            <View style={{ gap: theme.spacing.md, maxWidth: 400, width: '100%', alignSelf: 'center' }}>
              <Input label="Display Name" placeholder="Juan dela Cruz" value={displayName} onChangeText={setDisplayName} autoComplete="name" leftIcon="👤" />
              <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" leftIcon="📧" />
              <Input label="Password" placeholder="At least 6 characters" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" leftIcon="🔒" />
              <Input label="Confirm Password" placeholder="Re-enter your password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoComplete="new-password" leftIcon="🔒" />
              <Button label="Create Account" onPress={handleSignUp} loading={loading} fullWidth size="lg" />

              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xs, marginTop: theme.spacing.md }}>
                <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary }]}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.replace('/sign-in' as any)}>
                  <Text style={[theme.typography.labelLg, { color: theme.colors.primary[500] }]}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
