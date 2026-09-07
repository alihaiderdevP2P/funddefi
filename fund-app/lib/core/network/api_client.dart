import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../storage/token_storage.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({
    required TokenStorage storage,
    required String baseUrl,
    this.onUnauthorized,
  }) : _storage = storage {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': AppConfig.localeHeader,
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.readToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final status = error.response?.statusCode;
          if (status == 401) {
            onUnauthorized?.call();
          }
          handler.next(error);
        },
      ),
    );
  }

  final TokenStorage _storage;
  late final Dio _dio;
  void Function()? onUnauthorized;

  Dio get raw => _dio;

  void updateBaseUrl(String url) {
    _dio.options.baseUrl = url.endsWith('/')
        ? url.substring(0, url.length - 1)
        : url;
  }

  Future<T> get<T>(
    String path, {
    Map<String, dynamic>? query,
  }) async {
    try {
      final response = await _dio.get<T>(path, queryParameters: query);
      return response.data as T;
    } on DioException catch (e) {
      throw _map(e);
    }
  }

  Future<T> post<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? query,
    Options? options,
  }) async {
    try {
      final response = await _dio.post<T>(
        path,
        data: data,
        queryParameters: query,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _map(e);
    }
  }

  Future<T> patch<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? query,
  }) async {
    try {
      final response = await _dio.patch<T>(
        path,
        data: data,
        queryParameters: query,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _map(e);
    }
  }

  Future<T> delete<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? query,
  }) async {
    try {
      final response = await _dio.delete<T>(
        path,
        data: data,
        queryParameters: query,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _map(e);
    }
  }

  Future<Map<String, dynamic>> uploadImage(String filePath) async {
    try {
      final form = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath),
      });
      final response = await _dio.post<Map<String, dynamic>>(
        '/upload/image',
        data: form,
        options: Options(contentType: 'multipart/form-data'),
      );
      return response.data ?? <String, dynamic>{};
    } on DioException catch (e) {
      throw _map(e);
    }
  }

  ApiException _map(DioException error) {
    final status = error.response?.statusCode;
    final data = error.response?.data;
    String message = error.message ?? 'Network error';

    if (data is Map) {
      message = (data['message'] ?? data['error'] ?? message).toString();
      if (data['message'] is List) {
        message = (data['message'] as List).join(', ');
      }
    } else if (data is String && data.isNotEmpty) {
      message = data;
    } else if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      message = 'Request timed out. Is fund-server running?';
    } else if (error.type == DioExceptionType.connectionError) {
      message =
          'Cannot reach fund-server at ${_dio.options.baseUrl}. Check the API URL and that the backend is running.';
    }

    return ApiException(message, statusCode: status);
  }
}
