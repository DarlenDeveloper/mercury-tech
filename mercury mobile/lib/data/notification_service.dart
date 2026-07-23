import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Handles a message received while the app is in the background or terminated.
/// Must be a top-level function.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // No work needed: the system tray notification is shown automatically by FCM
  // for messages that include a `notification` payload. This handler simply
  // needs to exist so background data messages don't crash.
}

/// Central push-notification + local-notification manager.
///
/// - Requests notification permission (Android 13+/iOS).
/// - Creates the Android channel the backend targets (`mercury_notifications`).
/// - Shows a local notification for foreground messages.
/// - Subscribes each device to the broadcast `all` topic and the per-user
///   `user_<uid>` topic used by transactional notifications.
class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  /// Assigned by MaterialApp so notification taps can navigate.
  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _local =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'mercury_notifications',
    'Mercury Notifications',
    description: 'Order, quotation, repair and promotional updates.',
    importance: Importance.high,
  );

  String? _subscribedUid;
  bool _initialised = false;

  /// One-time setup. Call after Firebase.initializeApp().
  Future<void> init() async {
    if (_initialised) return;
    _initialised = true;

    // Request permission (shows the OS prompt on Android 13+ and iOS).
    await _messaging.requestPermission(alert: true, badge: true, sound: true);

    // Local notifications (used to render foreground messages).
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings();
    await _local.initialize(
      const InitializationSettings(android: androidInit, iOS: iosInit),
      onDidReceiveNotificationResponse: (response) => _openNotifications(),
    );

    // Ensure the Android channel exists (must match the backend channelId).
    await _local
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_channel);

    // Foreground messages: render a heads-up local notification.
    FirebaseMessaging.onMessage.listen(_showForeground);

    // Taps that opened the app from background / terminated.
    FirebaseMessaging.onMessageOpenedApp.listen((_) => _openNotifications());
    final initial = await _messaging.getInitialMessage();
    if (initial != null) {
      WidgetsBinding.instance
          .addPostFrameCallback((_) => _openNotifications());
    }

    // Everyone gets broadcast campaigns.
    await _safeSubscribe('all');
  }

  void _showForeground(RemoteMessage message) {
    final n = message.notification;
    if (n == null) return;
    _local.show(
      n.hashCode,
      n.title,
      n.body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _channel.id,
          _channel.name,
          channelDescription: _channel.description,
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
        iOS: const DarwinNotificationDetails(),
      ),
    );
  }

  void _openNotifications() {
    navigatorKey.currentState?.pushNamed('/notifications');
  }

  /// Subscribe to the per-user topic for [uid]; unsubscribe the previous one.
  /// Pass null on sign-out.
  Future<void> syncUser(String? uid) async {
    if (uid == _subscribedUid) return;
    if (_subscribedUid != null) {
      await _safeUnsubscribe('user_$_subscribedUid');
    }
    _subscribedUid = uid;
    if (uid != null) {
      await _safeSubscribe('user_$uid');
    }
  }

  Future<void> _safeSubscribe(String topic) async {
    try {
      await _messaging.subscribeToTopic(topic);
    } catch (_) {/* offline / unsupported — ignored */}
  }

  Future<void> _safeUnsubscribe(String topic) async {
    try {
      await _messaging.unsubscribeFromTopic(topic);
    } catch (_) {/* ignored */}
  }
}
